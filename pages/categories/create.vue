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
      <h1 class="text-3xl font-bold">Створити нову категорію</h1>
    </div>

    <!-- Validation Error Alert -->
    <UAlert
        v-if="validationError"
        color="red"
        variant="soft"
        :title="validationError"
        class="mb-6"
        @close="validationError = null"
    />

    <UCard class="max-w-2xl mx-auto">
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Назва *
          </label>
          <UInput
              v-model="formData.title"
              placeholder="Введіть назву категорії"
              @input="generateSlug"
              class="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
              required
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <UInput
              v-model="formData.slug"
              placeholder="category-slug (автоматично згенерується)"
              class="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
          />
          <p class="text-sm text-gray-500">Залиште порожнім для автоматичної генерації</p>
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
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
            >
              {{ category.title }}
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
              :disabled="submitting"
              size="lg"
          >
            Створити категорію
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'

interface BlogCategory {
  id: number
  title: string
  slug: string
}

const router = useRouter()

const formData = reactive({
  title: '',
  slug: '',
  parent_id: '',
  description: ''
})

const categories = ref<BlogCategory[]>([])
const submitting = ref(false)
const loadingCategories = ref(false)
const validationError = ref<string | null>(null)

const generateSlug = () => {
  if (formData.title && !formData.slug) {
    formData.slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
  }
}

const loadCategories = async () => {
  loadingCategories.value = true
  try {
    const response = await $fetch<BlogCategory[]>('http://localhost/api/blog/categories-all')
    categories.value = response
    console.log('Завантажені категорії:', response)
  } catch (error) {
    console.error('Помилка завантаження категорій:', error)
  } finally {
    loadingCategories.value = false
  }
}

const handleSubmit = async () => {
  if (submitting.value) return

  // Basic validation
  if (!formData.title?.trim()) {
    validationError.value = 'Назва є обов\'язковим полем'
    return
  }

  submitting.value = true
  validationError.value = null

  try {
    const submitData = {
      title: formData.title.trim(),
      slug: formData.slug?.trim() || null, // Відправляємо null якщо порожній
      parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      description: formData.description?.trim() || null
    }

    console.log('Відправляємо дані:', submitData)

    const response = await $fetch('http://localhost/api/blog/categories', {
      method: 'POST',
      body: submitData,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('Відповідь сервера:', response)

    await router.push('/categories')
  } catch (err: any) {
    console.error('Повна помилка:', err)
    console.error('Статус:', err.status)
    console.error('Дані помилки:', err.data)

    if (err.status === 422) {
      if (err.data?.errors) {
        // Laravel validation errors
        const errors = Object.values(err.data.errors).flat()
        validationError.value = errors.join(', ')
      } else if (err.data?.error) {
        validationError.value = err.data.error
      } else if (err.data?.message) {
        validationError.value = err.data.message
      } else {
        validationError.value = 'Помилка валідації даних. Перевірте консоль для деталей.'
      }
    } else {
      validationError.value = `Помилка створення: ${err.message || 'Невідома помилка'}`
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadCategories()
})

useHead({
  title: 'Створити нову категорію'
})
</script>
