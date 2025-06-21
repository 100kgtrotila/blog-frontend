<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4">
        <div class="flex items-center space-x-4">
          <NuxtLink
              to="/categories"
              class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Назад
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900">Створити категорію</h1>
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
                Назва категорії *
              </label>
              <input
                  id="title"
                  v-model="formData.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Введіть назву категорії"
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
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.title }}
              </option>
            </select>
            <p class="mt-1 text-sm text-gray-500">
              Доступно {{ categories.length }} категорій для вибору
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
                to="/categories"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Скасувати
            </NuxtLink>
            <button
                type="submit"
                :disabled="submitting"
                class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ submitting ? 'Створення...' : 'Створити категорію' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { categorySchema, type CategoryFormData } from '~/schemas'
import type { BlogCategory } from '~/types'

const router = useRouter()

const formData = reactive<CategoryFormData>({
  title: '',
  slug: '',
  description: '',
  parent_id: null
})

const categories = ref<BlogCategory[]>([])
const submitting = ref(false)
const loadingCategories = ref(false)
const errors = ref<Record<string, string>>({})

const generateSlug = () => {
  if (formData.title && !formData.slug) {
    formData.slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9а-я\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
  }
}

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

const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true

  try {
    const response = await $fetch('http://localhost/api/blog/categories', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: formData
    })

    alert('Категорію створено успішно!')
    router.push(`/categories/${response.slug}`)
  } catch (error: any) {
    console.error('Помилка створення категорії:', error)
    alert(`Помилка створення категорії: ${error.message}`)
  } finally {
    submitting.value = false
  }
}

const loadCategories = async () => {
  loadingCategories.value = true
  try {
    console.log('Завантаження категорій...')

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
  title: 'Створити категорію'
})
</script>
