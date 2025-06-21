<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center gap-4 mb-6">
      <UButton
          to="/categories"
          variant="ghost"
          icon="i-heroicons-arrow-left"
      >
        Назад до списку
      </UButton>
      <h1 class="text-2xl font-bold">Перегляд категорії</h1>
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
    >
      <template #actions>
        <UButton
            @click="loadCategory"
            color="red"
            variant="outline"
        >
          Спробувати знову
        </UButton>
      </template>
    </UAlert>

    <!-- Delete Error Alert -->
    <UAlert
        v-if="deleteError"
        color="red"
        variant="soft"
        :title="deleteError"
        class="mb-6"
        @close="deleteError = null"
    />

    <UCard v-else-if="category">
      <template #header>
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <UBadge
              label="📁 Звичайна"
              color="gray"
          />

          <UBadge
              label="1 пост"
              color="blue"
          />
        </div>

        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {{ category.title }}
        </h1>

        <div class="flex flex-wrap items-center text-sm text-gray-600 gap-4">
          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-hashtag" />
            <span>ID: {{ category.id }}</span>
          </div>

          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-link" />
            <span>{{ category.slug }}</span>
          </div>

          <div v-if="category.parent_title" class="flex items-center gap-1">
            <UIcon name="i-heroicons-folder" />
            <span>Батьківська: {{ category.parent_title }}</span>
          </div>
        </div>
      </template>

      <div v-if="category.description" class="px-6 py-6 bg-gray-50 border-b border-gray-200">
        <div class="text-lg text-gray-700 leading-relaxed">
          {{ category.description }}
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            Створено: {{ formatDate(category.created_at) }}
            <span v-if="category.updated_at !== category.created_at" class="ml-4">
              Оновлено: {{ formatDate(category.updated_at) }}
            </span>
          </div>

          <div class="flex gap-2">
            <UButton
                :to="`/categories/edit/${category.slug}`"
                icon="i-heroicons-pencil-square"
            >
              Редагувати
            </UButton>
            <UButton
                @click="deleteCategory"
                color="red"
                variant="outline"
                icon="i-heroicons-trash"
                :loading="deleting"
                :disabled="deleting"
            >
              Видалити
            </UButton>
          </div>
        </div>
      </template>
    </UCard>

    <UCard v-else class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <UIcon name="i-heroicons-folder" class="w-16 h-16 mx-auto" />
      </div>
      <h3 class="text-xl font-medium text-gray-900 mb-2">Категорію не знайдено</h3>
      <p class="text-gray-600 mb-6">Можливо, категорію було видалено або URL неправильний</p>
      <UButton
          to="/categories"
          size="lg"
      >
        Повернутися до списку
      </UButton>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

interface BlogCategory {
  id: number
  title: string
  slug: string
  description?: string
  parent_title?: string
  created_at: string
  updated_at: string
}

const route = useRoute()
const router = useRouter()

const category = ref<BlogCategory | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const deleteError = ref<string | null>(null)
const deleting = ref(false)

const categorySlug = computed(() => route.params.slug as string)

const loadCategory = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<BlogCategory>(`http://localhost/api/blog/categories/${categorySlug.value}`)
    category.value = response
  } catch (err: any) {
    if (err.status === 404) {
      error.value = 'Категорію не знайдено'
    } else {
      error.value = `Помилка завантаження категорії: ${err.message}`
    }
    category.value = null
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Не вказано'
  return new Date(dateString).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const deleteCategory = async () => {
  if (!category.value || deleting.value) return

  deleting.value = true
  deleteError.value = null

  try {
    await $fetch(`http://localhost/api/blog/categories/${category.value.id}`, {
      method: 'DELETE'
    })

    await router.push('/categories')
  } catch (err: any) {
    console.error('Помилка видалення:', err)

    // Handle different error types
    if (err.status === 422) {
      if (err.data?.error) {
        deleteError.value = err.data.error
      } else {
        deleteError.value = 'Неможливо видалити категорію. Можливо, вона містить пости або дочірні категорії.'
      }
    } else {
      deleteError.value = `Помилка видалення: ${err.message || 'Невідома помилка'}`
    }
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadCategory()
})

watch(() => route.params.slug, () => {
  if (route.params.slug) {
    loadCategory()
  }
})

useHead({
  title: computed(() => category.value ? `${category.value.title} - Категорії` : 'Завантаження...')
})
</script>
