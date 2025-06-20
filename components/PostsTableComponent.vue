<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-center">
      <div class="w-full">
        <nav class="navbar bg-gray-100 p-4 mb-4 rounded">
          <NuxtLink to="/admin/blog/posts/create" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Додати
          </NuxtLink>
        </nav>

        <div class="card bg-white shadow-lg rounded-lg">
          <div class="card-body p-6">
            <div v-if="loading" class="text-center py-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p class="mt-2">Завантаження...</p>
            </div>

            <div v-else-if="error" class="text-red-500 text-center py-4">
              <p>Помилка завантаження: {{ error }}</p>
              <button @click="loadPosts()" class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Спробувати знову
              </button>
            </div>

            <div v-else>
              <table class="table table-auto w-full border-collapse">
                <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2 text-left">#</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Автор</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Категорія</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Заголовок</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Дата публікації</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50">
                  <td class="border border-gray-300 px-4 py-2">{{ post.id }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ post.user?.name || 'Невідомо' }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ post.category?.title || 'Без категорії' }}</td>
                  <td class="border border-gray-300 px-4 py-2">
                    <NuxtLink :to="`/admin/blog/posts/${post.id}/edit`" class="text-blue-600 hover:text-blue-800 underline">
                      {{ post.title }}
                    </NuxtLink>
                  </td>
                  <td class="border border-gray-300 px-4 py-2">
                    {{ formatDate(post.published_at) }}
                  </td>
                </tr>
                </tbody>
              </table>

              <div v-if="posts.length === 0" class="text-center py-8 text-gray-500">
                <p>Постів не знайдено</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { $fetch } from 'ofetch'

interface User {
  id: number
  name: string
}

interface Category {
  id: number
  title: string
}

interface BlogPost {
  id: number
  title: string
  published_at: string
  user?: User
  category?: Category
}

const posts = ref<BlogPost[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadPosts = async () => {
  loading.value = true
  error.value = null

  try {


    let response = null
    let lastError = null
    }

    if (!response) {
      throw lastError || new Error('Не вдалося підключитися до жодного API endpoint')
    }

    if (Array.isArray(response)) {
      posts.value = response
    } else if (response.data && Array.isArray(response.data)) {
      posts.value = response.data
    } else {
      console.log('Отримана відповідь:', response)
      posts.value = []
    }

  } catch (err: any) {
    console.error('Помилка при завантаженні постів:', err)
    error.value = err.message || 'Невідома помилка'
  } finally {
    loading.value = false
  }
}


const formatDate = (dateString: string) => {
  if (!dateString) return 'Не опубліковано'

  try {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

onMounted(() => {
  loadPosts()
})
</script>
