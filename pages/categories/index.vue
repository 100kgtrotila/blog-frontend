<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-center">
      <div class="w-full">
        <nav class="navbar bg-gray-100 p-4 mb-4 rounded">
          <NuxtLink to="/categories/create" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Додати категорію
          </NuxtLink>
        </nav>

        <div class="card bg-white shadow-lg rounded-lg">
          <div class="card-body p-6">
            <div v-if="error" class="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700">
              <p class="font-medium">Помилка підключення</p>
              <p class="text-sm mt-1">{{ error }}</p>
            </div>

            <UTable :data="categories" :columns="columns" :loading="loading" class="w-full" />

            <div v-if="!loading && categories.length === 0" class="text-center py-8 text-gray-500">
              <div class="text-4xl mb-2">📁</div>
              <p class="text-lg font-medium">Категорій не знайдено</p>
              <p class="text-sm">Створіть першу категорію для початку роботи</p>
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
                  <span class="px-3 py-1 bg-green-500 text-white rounded text-sm">
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
import { useHead } from '#app'
import type { BlogCategory } from '~/types'

interface ApiResponse {
  data: BlogCategory[]
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

const categories = ref<BlogCategory[]>([])
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
    id: 'title',
    accessorKey: 'title',
    header: 'Назва',
    cell: ({ row }: any) => h('div', { class: 'flex items-center' }, [
      h('span', { class: row.original.is_root ? 'text-green-600 mr-2' : 'text-gray-400 mr-2' }, row.original.is_root ? '🏠' : '📁'),
      h('a', {
        href: `/categories/${row.original.slug}`,
        class: 'text-green-600 hover:text-green-800 hover:underline font-medium'
      }, row.original.title)
    ])
  },
  {
    id: 'slug',
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }: any) => h('span', { class: 'font-mono text-sm text-gray-600' }, row.original.slug)
  },
  {
    id: 'parent_title',
    accessorKey: 'parent_title',
    header: 'Батьківська',
    cell: ({ row }: any) => h('span', { class: 'text-sm text-gray-600' }, row.original.parent_title || 'Немає')
  },
  {
    id: 'posts_count',
    accessorKey: 'posts_count',
    header: 'Постів',
    cell: ({ row }: any) => h('span', {
      class: 'px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'
    }, row.original.posts_count || '0')
  },
  {
    id: 'is_root',
    accessorKey: 'is_root',
    header: 'Тип',
    cell: ({ row }: any) => h('span', {
      class: row.original.is_root
          ? 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'
          : 'px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium'
    }, row.original.is_root ? 'Корінь' : 'Звичайна')
  },
  {
    id: 'actions',
    header: 'Дії',
    cell: ({ row }: any) => h('div', { class: 'flex space-x-2' }, [
      h('a', {
        href: `/categories/${row.original.slug}`,
        class: 'text-blue-600 hover:text-blue-800 text-sm'
      }, 'Переглянути'),
      h('a', {
        href: `/categories/edit/${row.original.slug}`,
        class: 'text-green-600 hover:text-green-800 text-sm'
      }, 'Редагувати'),
      h('button', {
        onClick: () => handleDelete(row.original),
        class: 'text-red-600 hover:text-red-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed',
        disabled: row.original.is_root || (row.original.posts_count && row.original.posts_count > 0)
      }, 'Видалити')
    ])
  }
]

const loadCategories = async (page = 1, pageSize = 10) => {
  loading.value = true
  error.value = null

  try {
    console.log(`Завантаження категорій: сторінка ${page}, розмір ${pageSize}`)

    const response = await $fetch<ApiResponse>(`http://localhost/api/blog/categories?page=${page}&per_page=${pageSize}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    console.log('Дані отримано:', response)

    categories.value = response.data
    meta.value = response.meta
    currentPage.value = response.meta.current_page

  } catch (err: any) {
    console.error('Помилка API:', err)
    error.value = `Помилка завантаження даних: ${err.message}`
    categories.value = []
  } finally {
    loading.value = false
  }
}

const handleDelete = async (category: BlogCategory) => {
  if (category.is_root) {
    alert('Неможливо видалити кореневу категорію')
    return
  }

  if (category.posts_count && category.posts_count > 0) {
    alert('Неможливо видалити категорію з постами')
    return
  }

  const confirmed = confirm(`Ви впевнені, що хочете видалити категорію "${category.title}"?`)
  if (!confirmed) return

  try {
    await $fetch(`http://localhost/api/blog/categories/${category.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    alert('Категорію видалено!')
    await loadCategories(currentPage.value, perPage.value)
  } catch (error: any) {
    alert(`Помилка видалення категорії: ${error.message}`)
  }
}

const goToPage = (page: number) => {
  loadCategories(page, perPage.value)
}

const changePageSize = () => {
  currentPage.value = 1
  loadCategories(1, perPage.value)
}

useHead({
  title: 'Категорії блогу'
})

onMounted(() => {
  loadCategories()
})
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
