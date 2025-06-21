<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-4">
      <!-- Header with back button -->
      <div class="mb-6">
        <nav class="flex items-center space-x-4 mb-4">
          <NuxtLink
              to="/categories"
              class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Назад до списку
          </NuxtLink>
          <h1 class="text-2xl font-bold text-gray-900">Перегляд категорії</h1>
        </nav>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Завантаження категорії...</span>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-600 mb-4">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-red-800 mb-2">Помилка завантаження</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button
            @click="loadCategory"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Спробувати знову
        </button>
      </div>

      <!-- Category content -->
      <div v-else-if="category" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Category header -->
        <div class="px-6 py-8 border-b border-gray-200">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <!-- Type badge -->
            <span
                :class="category.is_root
                ? 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'
                : 'px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium'"
            >
              {{ category.is_root ? '🏠 Корінь' : '📁 Звичайна' }}
            </span>

            <!-- Posts count badge -->
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {{ category.posts_count || 0 }} {{ category.posts_count === 1 ? 'пост' : 'постів' }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {{ category.title }}
          </h1>

          <!-- Meta information -->
          <div class="flex flex-wrap items-center text-sm text-gray-600 gap-4">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              <span>ID: {{ category.id }}</span>
            </div>

            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
              <span>{{ category.slug }}</span>
            </div>

            <div v-if="category.parent_title" class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
              </svg>
              <span>Батьківська: {{ category.parent_title }}</span>
            </div>
          </div>
        </div>

        <!-- Category description -->
        <div v-if="category.description" class="px-6 py-6 bg-gray-50 border-b border-gray-200">
          <div class="text-lg text-gray-700 leading-relaxed">
            {{ category.description }}
          </div>
        </div>

        <!-- Category footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-500">
              Створено: {{ formatDate(category.created_at) }}
              <span v-if="category.updated_at !== category.created_at" class="ml-4">
                Оновлено: {{ formatDate(category.updated_at) }}
              </span>
            </div>

            <!-- Action buttons -->
            <div class="flex space-x-2">
              <NuxtLink
                  :to="`/categories/edit/${category.slug}`"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Редагувати
              </NuxtLink>
              <button
                  @click="deleteCategory"
                  :disabled="category.is_root || (category.posts_count && category.posts_count > 0)"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Not found state -->
      <div v-else class="bg-white rounded-lg shadow-lg p-12 text-center">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">Категорію не знайдено</h3>
        <p class="text-gray-600 mb-6">Можливо, категорію було видалено або URL неправильний</p>
        <NuxtLink
            to="/categories"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Повернутися до списку
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import type { BlogCategory } from '~/types'

const route = useRoute()
const router = useRouter()
const { getCategory, deleteCategory: deleteCategoryApi } = useApi()

const category = ref<BlogCategory | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const categorySlug = computed(() => route.params.slug as string)

const loadCategory = async () => {
  loading.value = true
  error.value = null

  try {
    console.log(`Завантаження категорії: ${categorySlug.value}`)

    const response = await $fetch<BlogCategory>(`http://localhost/api/blog/categories/${categorySlug.value}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    category.value = response
    console.log('Категорію отримано:', category.value)
  } catch (err: any) {
    console.error('Помилка API:', err)
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

  try {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const deleteCategory = async () => {
  if (!category.value) return

  if (category.value.is_root) {
    alert('Неможливо видалити кореневу категорію')
    return
  }

  if (category.value.posts_count && category.value.posts_count > 0) {
    alert('Неможливо видалити категорію з постами')
    return
  }

  const confirmed = confirm(`Ви впевнені, що хочете видалити категорію "${category.value.title}"?`)
  if (!confirmed) return

  try {
    await $fetch(`http://localhost/api/blog/categories/${category.value.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    alert('Категорію успішно видалено!')
    router.push('/categories')
  } catch (err: any) {
    console.error('Помилка видалення:', err)
    alert(`Помилка видалення категорії: ${err.message}`)
  }
}

// SEO and meta
useHead({
  title: computed(() => category.value ? `${category.value.title} - Категорії` : 'Завантаження...'),
  meta: [
    {
      name: 'description',
      content: computed(() => category.value?.description || 'Перегляд категорії блогу')
    }
  ]
})

// Load category on mount and when slug changes
onMounted(() => {
  loadCategory()
})

watch(() => route.params.slug, () => {
  if (route.params.slug) {
    loadCategory()
  }
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
