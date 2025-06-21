<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4">
        <div class="flex items-center space-x-4">
          <NuxtLink
              to="/blogpostui"
              class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Назад
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900">Створити новий пост</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto py-6 px-4">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <!-- Debug info -->
        <div v-if="loadingCategories" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p class="text-blue-700">Завантаження категорій...</p>
        </div>

        <div v-if="categories.length > 0" class="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p class="text-green-700">Завантажено {{ categories.length }} категорій</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Заголовок *
              </label>
              <input
                  id="title"
                  v-model="formData.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введіть заголовок посту"
                  @input="generateSlug"
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
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="post-slug"
              />
              <p v-if="errors.slug" class="mt-1 text-sm text-red-600">{{ errors.slug }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="category_id" class="block text-sm font-medium text-gray-700 mb-2">
                Категорія *
              </label>
              <select
                  id="category_id"
                  v-model="formData.category_id"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Оберіть категорію</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.title }}
                </option>
              </select>
              <p v-if="errors.category_id" class="mt-1 text-sm text-red-600">{{ errors.category_id }}</p>
              <p class="mt-1 text-sm text-gray-500">
                Доступно {{ categories.length }} категорій для вибору
              </p>
            </div>

            <div>
              <label class="flex items-center space-x-2">
                <input
                    v-model="formData.is_published"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    @change="handlePublishChange"
                />
                <span class="text-sm font-medium text-gray-700">Опублікувати зараз</span>
              </label>
              <div v-if="formData.is_published" class="mt-2">
                <input
                    v-model="formattedPublishedAt"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label for="excerpt" class="block text-sm font-medium text-gray-700 mb-2">
              Короткий опис
            </label>
            <textarea
                id="excerpt"
                v-model="formData.excerpt"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Короткий опис посту для превью"
            ></textarea>
            <p v-if="errors.excerpt" class="mt-1 text-sm text-red-600">{{ errors.excerpt }}</p>
          </div>

          <div>
            <label for="content_raw" class="block text-sm font-medium text-gray-700 mb-2">
              Контент *
            </label>
            <textarea
                id="content_raw"
                v-model="formData.content_raw"
                rows="12"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Напишіть контент посту тут..."
            ></textarea>
            <p v-if="errors.content_raw" class="mt-1 text-sm text-red-600">{{ errors.content_raw }}</p>
          </div>

          <div class="flex justify-end space-x-4">
            <NuxtLink
                to="/blogpostui"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Скасувати
            </NuxtLink>
            <button
                type="submit"
                :disabled="submitting"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ submitting ? 'Створення...' : 'Створити пост' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { postSchema, type PostFormData } from '~/schemas'
import type { BlogCategory } from '~/types'

const router = useRouter()

const formData = reactive<PostFormData>({
  title: '',
  slug: '',
  category_id: 0,
  excerpt: '',
  content_raw: '',
  is_published: false,
  published_at: ''
})

const categories = ref<BlogCategory[]>([])
const submitting = ref(false)
const loadingCategories = ref(false)
const errors = ref<Record<string, string>>({})

// Computed для форматування дати для datetime-local поля
const formattedPublishedAt = computed({
  get() {
    if (!formData.published_at) return ''

    try {
      const date = new Date(formData.published_at)
      if (isNaN(date.getTime())) return ''

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch {
      return ''
    }
  },
  set(value: string) {
    if (value) {
      const date = new Date(value)
      formData.published_at = date.toISOString()
    } else {
      formData.published_at = ''
    }
  }
})

const generateSlug = () => {
  if (formData.title && !formData.slug) {
    formData.slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
  }
}

const handlePublishChange = () => {
  if (formData.is_published && !formData.published_at) {
    formData.published_at = new Date().toISOString()
  }
}

const validateForm = () => {
  try {
    postSchema.parse(formData)
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

const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true

  try {
    const response = await $fetch('http://localhost/api/blog/posts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: formData
    })

    alert('Пост успішно створено!')
    router.push(`/blogpostui/${response.slug}`)
  } catch (error: any) {
    console.error('Помилка створення посту:', error)
    alert(`Помилка створення посту: ${error.message}`)
  } finally {
    submitting.value = false
  }
}

const loadCategories = async () => {
  loadingCategories.value = true
  try {
    console.log('Завантаження категорій для постів...')

    const response = await $fetch<BlogCategory[]>('http://localhost/api/blog/categories-all', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    console.log('Категорії завантажено:', response)
    categories.value = response
  } catch (error) {
    console.error('Помилка завантаження категорій:', error)
    alert('Помилка завантаження категорій')
  } finally {
    loadingCategories.value = false
  }
}

onMounted(() => {
  loadCategories()
})

useHead({
  title: 'Створити новий пост',
  meta: [
    { name: 'description', content: 'Створення нового посту блогу' }
  ]
})
</script>
