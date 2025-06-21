<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4">
        <div class="flex items-center space-x-4">
          <NuxtLink
              :to="category ? `/categories/${category.slug}` : '/categories'"
              class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Назад
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900">Редагувати категорію</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto py-6 px-4">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span class="ml-3">Завантаження...</span>
      </div>

      <div v-else-if="error" class="text-red-500 p-4 bg-red-50 rounded">
        <h3 class="font-medium">Помилка завантаження</h3>
        <p class="mt-1">{{ error }}</p>
        <button @click="loadData" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Спробувати знову
        </button>
      </div>

      <div v-else-if="category" class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-6">Редагувати "{{ category.title }}"</h2>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Назва категорії *
              </label>
              <input
                  id="title"
                  v-model="formData.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Введіть назву категорії"
              />
              <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
            </div>

            <div>
              <label for="slug" class="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                  id="slug"
                  v-model="formData.slug"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="category-slug"
              />
              <p v-if="errors.slug" class="mt-1 text-sm text-red-600">{{ errors.slug }}</p>
            </div>
          </div>

          <div>
            <label for="parent_id" class="block text-sm font-medium text-gray-700 mb-2">
              Батьківська категорія
            </label>
            <select
                id="parent_id"
                v-model="formData.parent_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            <p class="mt-1 text-sm text-gray-500">
              Доступно {{ availableCategories.length }} категорій для вибору
            </p>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Опис
            </label>
            <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Опис категорії"
            ></textarea>
            <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
          </div>

          <div class="flex justify-end space-x-4">
            <NuxtLink
                :to="`/categories/${category.slug}`"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Скасувати
            </NuxtLink>
            <button
                type="submit"
                :disabled="submitting"
                class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ submitting ? 'Оновлення...' : 'Оновити категорію' }}
            </button>
          </div>
        </form>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-600">Категорію не знайдено</p>
        <NuxtLink to="/categories" class="mt-4 inline-block px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Повернутися до списку
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { categorySchema, type CategoryFormData } from '~/schemas'
import type { BlogCategory } from '~/types'

const route = useRoute()
const router = useRouter()

const categorySlug = computed(() => route.params.slug as string)

const category = ref<BlogCategory | null>(null)
const categories = ref<BlogCategory[]>([])
const loading = ref(true)
const submitting = ref(false)
const error = ref<string | null>(null)
const errors = ref<Record<string, string>>({})

const formData = reactive<CategoryFormData>({
  title: '',
  slug: '',
  description: '',
  parent_id: null
})

// Доступні категорії (виключаємо поточну категорію)
const availableCategories = computed(() => {
  if (!categories.value || !category.value) return []
  return categories.value.filter(cat => cat.id !== category.value?.id)
})

const validateForm = () => {
  try {
    categorySchema.parse(formData)
    errors.value = {}
    return true
  } catch (error: any) {
    errors.value = {}
    if (error.errors) {
      error.errors.forEach((err: any) => {
        errors.value[err.path[0]] = err.message
      })
    }
    return false
  }
}

const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    console.log(`Завантаження категорії: ${categorySlug.value}`)

    // Завантажуємо категорію та всі категорії паралельно
    const [categoryData, categoriesData] = await Promise.all([
      $fetch<BlogCategory>(`http://localhost/api/blog/categories/${categorySlug.value}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }),
      $fetch<BlogCategory[]>('http://localhost/api/blog/categories-all', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
    ])

    console.log('Категорія завантажена:', categoryData)
    console.log('Всі категорії завантажені:', categoriesData)

    category.value = categoryData
    categories.value = categoriesData

    // Заповнюємо форму
    formData.title = categoryData.title
    formData.slug = categoryData.slug
    formData.description = categoryData.description || ''
    formData.parent_id = categoryData.parent_id || null

  } catch (err: any) {
    console.error('Помилка завантаження:', err)
    if (err.status === 404) {
      error.value = 'Категорію не знайдено'
    } else {
      error.value = err.message || 'Помилка завантаження категорії'
    }
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!category.value || !validateForm()) return

  submitting.value = true

  try {
    const response = await $fetch(`http://localhost/api/blog/categories/${category.value.id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: formData
    })

    alert('Категорію оновлено успішно!')
    router.push(`/categories/${response.slug}`)
  } catch (error: any) {
    console.error('Помилка оновлення категорії:', error)
    alert(`Помилка оновлення категорії: ${error.message}`)
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
