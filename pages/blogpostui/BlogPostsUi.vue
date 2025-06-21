<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-center">
      <div class="w-full">
        <nav class="navbar bg-gray-100 p-4 mb-4 rounded">
          <NuxtLink to="/blogpostui/create" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Додати
          </NuxtLink>
        </nav>

        <div class="card bg-white shadow-lg rounded-lg">
          <div class="card-body p-6">
            <div v-if="error" class="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700">
              <p class="font-medium">Помилка підключення</p>
              <p class="text-sm mt-1">{{ error }}</p>
            </div>

            <UTable :data="posts" :columns="columns" :loading="loading" class="w-full" />

            <div v-if="!loading && posts.length === 0" class="text-center py-8 text-gray-500">
              <div class="text-4xl mb-2">📝</div>
              <p class="text-lg font-medium">Постів не знайдено</p>
              <p class="text-sm">Створіть перший пост для початку роботи</p>
            </div>

            <div v-if="meta.total > 0" class="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div class="text-sm text-gray-700">
                Показано {{ meta.from }} - {{ meta.to }} з {{ meta.total }} записів
              </div>

              <div class="flex items-center space-x-4">
                <select v-model="perPage" @change="changePageSize" class="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option :value="10">10 на сторінці</option>
                  <option :value="25">25 на сторінці</option>
                  <option :value="50">50 на сторінці</option>
                  <option :value="100">100 на сторінці</option>
                </select>

                <div class="flex items-center space-x-2">
                  <button @click="goToPage(1)" :disabled="currentPage === 1" class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    Перша
                  </button>
                  <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    ←
                  </button>
                  <span class="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                    {{ currentPage }} / {{ meta.last_page }}
                  </span>
                  <button @click="goToPage(currentPage + 1)" :disabled="currentPage === meta.last_page" class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    →
                  </button>
                  <button @click="goToPage(meta.last_page)" :disabled="currentPage === meta.last_page" class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    Остання
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { $fetch } from 'ofetch'

interface User {
  name: string
}

interface Category {
  title: string
}

interface BlogPost {
  id: number
  title: string
  slug: string
  is_published: boolean
  published_at: string
  user: User
  category: Category
}

interface ApiResponse {
  data: BlogPost[]
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

const posts = ref<BlogPost[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const perPage = ref(10)
const currentPage = ref(1)

const meta = ref({
  current_page: 1,
  from: 0,
  last_page: 1,
  per_page: 10,
  to: 0,
  total: 0
})

const columns = [
  {
    id: 'id',
    accessorKey: 'id',
    header: '#',
    cell: ({ row }: any) => h('span', { class: 'text-gray-500 font-mono' }, `#${row.original.id}`)
  },
  {
    id: 'user',
    accessorKey: 'user.name',
    header: 'Автор',
    cell: ({ row }: any) => h('span', { class: 'font-medium' }, row.original.user?.name || 'Невідомо')
  },
  {
    id: 'category',
    accessorKey: 'category.title',
    header: 'Категорія',
    cell: ({ row }: any) => h('span', {
      class: 'px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'
    }, row.original.category?.title || 'Без категорії')
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: 'Заголовок',
    cell: ({ row }: any) => h('a', {
      href: `/blogpostui/${row.original.slug}`,
      class: 'text-blue-600 hover:text-blue-800 hover:underline font-medium'
    }, row.original.title)
  },
  {
    id: 'published_at',
    accessorKey: 'published_at',
    header: 'Дата публікації',
    cell: ({ row }: any) => h('span', {
      class: 'text-sm text-gray-600'
    }, row.original.published_at || 'Не опубліковано')
  },
  {
    id: 'is_published',
    accessorKey: 'is_published',
    header: 'Статус',
    cell: ({ row }: any) => h('span', {
      class: row.original.is_published
          ? 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'
          : 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium'
    }, row.original.is_published ? 'Опубліковано' : 'Чернетка')
  }
]

const loadPosts = async (page = 1, pageSize = 10) => {
  loading.value = true
  error.value = null

  try {
    console.log(`Завантаження постів: сторінка ${page}, розмір ${pageSize}`)

    const response = await $fetch<ApiResponse>(`http://localhost/api/blog/posts?page=${page}&per_page=${pageSize}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    console.log('Дані отримано:', response)

    posts.value = response.data
    meta.value = response.meta
    currentPage.value = response.meta.current_page

  } catch (err: any) {
    console.error('Помилка API:', err)
    error.value = `Помилка завантаження даних: ${err.message}`
    posts.value = []
  } finally {
    loading.value = false
  }
}

const goToPage = (page: number) => {
  loadPosts(page, perPage.value)
}

const changePageSize = () => {
  currentPage.value = 1
  loadPosts(1, perPage.value)
}

const onMountedHook = () => {
  loadPosts()
}

onMounted(onMountedHook)
</script>

<style scoped>
.container {
  max-width: 1400px;
}

.navbar {
  border-radius: 0.5rem;
}

.card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

@media (max-width: 768px) {
  .container {
    padding: 1rem 0.5rem;
  }
}
</style>
