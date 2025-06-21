<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Блог Система</h1>
          <p class="text-gray-600">Оберіть версію для роботи</p>
        </div>

        <div class="space-y-4">
          <NuxtLink
              to="/blogpost"
              class="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
          >
            <div class="flex items-center justify-center space-x-2">
              <span>📝</span>
              <span>Звичайна версія</span>
            </div>
            <p class="text-sm text-blue-100 mt-1">Базовий функціонал блогу</p>
          </NuxtLink>

          <NuxtLink
              to="/blogpostui"
              class="block w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
          >
            <div class="flex items-center justify-center space-x-2">
              <span>🎨</span>
              <span>UI версія</span>
            </div>
            <p class="text-sm text-indigo-100 mt-1">З Nuxt UI компонентами та CRUD</p>
          </NuxtLink>

          <NuxtLink
              to="/categories"
              class="block w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
          >
            <div class="flex items-center justify-center space-x-2">
              <span>📂</span>
              <span>Категорії</span>
            </div>
            <p class="text-sm text-green-100 mt-1">Управління категоріями</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useHead } from '#app'
import type { BlogPost, PaginatedResponse } from '~/types'

const { getPosts } = useApi()
const currentPage = ref(1)
const posts = ref<BlogPost[]>([])
const pagination = ref<PaginatedResponse<BlogPost>>({
  data: [],
  meta: {
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: 10,
    to: 0,
    total: 0
  },
  links: {
    first: '',
    last: '',
    prev: undefined,
    next: undefined
  }
})
const pending = ref(true)

const loadPosts = async (page = 1) => {
  try {
    pending.value = true
    const response = await getPosts(page)
    posts.value = response.data
    pagination.value = response
  } catch (error) {
    console.error('Error loading posts:', error)
  } finally {
    pending.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadPosts()
})

useHead({
  title: 'Блог Система - Головна',
  meta: [
    { name: 'description', content: 'Система управління блогом' }
  ]
})
</script>
