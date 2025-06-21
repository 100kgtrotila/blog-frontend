<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center gap-4 mb-8">
      <UButton
          to="/categories"
          variant="ghost"
          icon="i-heroicons-arrow-left"
      >
        Назад
      </UButton>
      <h1 class="text-3xl font-bold">Редагувати категорію</h1>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin w-8 h-8" />
    </div>

    <UAlert
        v-else-if="error"
        color="red"
        variant="solid"
        :title="error"
        class="mb-6"
    />

    <!-- Validation Error Alert -->
    <UAlert
        v-if="validationError"
        color="red"
        variant="soft"
        :title="validationError"
        class="mb-6"
        @close="validationError = null"
    />

    <UCard v-else-if="category" class="max-w-2xl mx-auto">
      <template #header>
        <h2 class="text-xl font-semibold">Редагувати "{{ category.title }}"</h2>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Назва *
          </label>
          <UInput
              v-model="formData.title"
              placeholder="Введіть назву категорії"
              class="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
              required
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Slug *
          </label>
          <UInput
              v-model="formData.slug"
              placeholder="category-slug"
              class="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
              required
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Батьківська категорія
          </label>
          <select
              v-model="formData.parent_id"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :disabled="loadingCategories"
          >
            <option value="">Без батьківської категорії</option>
            <option
                v-for="cat in availableCategories"
                :key="cat.id"
                :value="cat.id"
            >
              {{ cat.title }}
            </option>
          </select>
          <div v-if="loadingCategories" class="text-sm text-gray-500 mt-2">
            Завантаження категорій...
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Опис
          </label>
          <UTextarea
              v-model="formData.description"
              placeholder="Опис категорії"
              :rows="4"
              class="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
          />
        </div>

        <div class="flex justify-end gap-4 pt-6">
          <UButton
              to="/categories"
              variant="ghost"
              size="lg"
              type="button"
          >
            Скасувати
          </UButton>
          <UButton
              type="submit"
              :loading="submitting"
              size="lg"
              :disabled="submitting"
          >
            Оновити категорію
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'

interface BlogCategory {
  id: number
  title: string
  slug: string
  parent_id?: number
  description?: string
  created_at: string
  updated_at: string
}

const route = useRoute()
const router = useRouter()

const categorySlug = computed(() => route.params.slug as string)

const category = ref<BlogCategory | null>(null)
const categories = ref<BlogCategory[]>([])
const loading = ref(true)
const submitting = ref(false)
const loadingCategories = ref(false)
const error = ref<string | null>(null)
const validationError = ref<string | null>(null)

const formData = reactive({
  title: '',
  slug: '',
  parent_id: '',
  description: ''
})

const availableCategories = computed(() =>
    categories.value.filter(cat => cat.slug !== categorySlug.value)
)

const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    const [categoryData, categoriesData] = await Promise.all([
      $fetch<BlogCategory>(`http://localhost/api/blog/categories/${categorySlug.value}`),
      $fetch<BlogCategory[]>('http://localhost/api/blog/categories-all')
    ])

    category.value = categoryData
    categories.value = categoriesData

    // Fill form with category data
    formData.title = categoryData.title
    formData.slug = categoryData.slug
    formData.parent_id = categoryData.parent_id ? categoryData.parent_id.toString() : ''
    formData.description = categoryData.description || ''

  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Сталася помилка'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!category.value || submitting.value) return

  // Basic validation
  if (!formData.title.trim() || !formData.slug.trim()) {
    validationError.value = 'Назва та Slug є обов\'язковими полями'
    return
  }

  submitting.value = true
  validationError.value = null

  try {
    const submitData = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      description: formData.description.trim() || null
    }

    console.log('Відправляємо дані:', submitData)

    await $fetch(`http://localhost/api/blog/categories/${category.value.id}`, {
      method: 'PUT',
      body: submitData
    })

    await router.push('/categories')
  } catch (err: any) {
    console.error('Помилка оновлення категорії:', err)

    if (err.status === 422) {
      if (err.data?.errors) {
        // Laravel validation errors
        const errors = Object.values(err.data.errors).flat()
        validationError.value = errors.join(', ')
      } else if (err.data?.error) {
        validationError.value = err.data.error
      } else {
        validationError.value = 'Помилка валідації даних'
      }
    } else {
      validationError.value = `Помилка оновлення: ${err.message || 'Невідома помилка'}`
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})

useHead({
  title: computed(() => category.value ? `Редагувати: ${category.value.title}` : 'Редагувати категорію')
})
</script>
