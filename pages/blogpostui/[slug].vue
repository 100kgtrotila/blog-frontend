
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-4">
      <!-- Header with back button -->
      <div class="mb-6">
        <nav class="flex items-center space-x-4 mb-4">
          <NuxtLink
              to="/blogpostsui"
              class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Назад до списку
          </NuxtLink>
          <h1 class="text-2xl font-bold text-gray-900">Перегляд посту</h1>
        </nav>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600">Завантаження посту...</span>
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
            @click="loadPost"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Спробувати знову
        </button>
      </div>

      <!-- Post content -->
      <div v-else-if="post" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Post header -->
        <div class="px-6 py-8 border-b border-gray-200">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <!-- Category badge -->
            <span
                v-if="post.category"
                class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {{ post.category.title }}
            </span>

            <!-- Status badge -->
            <span
                :class="post.is_published
                ? 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'
                : 'px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium'"
            >
              {{ post.is_published ? 'Опубліковано' : 'Чернетка' }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {{ post.title }}
          </h1>

          <!-- Meta information -->
          <div class="flex flex-wrap items-center text-sm text-gray-600 gap-4">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span>{{ post.user?.name || 'Невідомий автор' }}</span>
            </div>

            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>{{ formatDate(post.published_at || post.created_at) }}</span>
            </div>

            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              <span>ID: {{ post.id }}</span>
            </div>
          </div>
        </div>

        <!-- Post excerpt -->
        <div v-if="post.excerpt" class="px-6 py-6 bg-gray-50 border-b border-gray-200">
          <div class="text-lg text-gray-700 italic leading-relaxed">
            <svg class="w-6 h-6 text-gray-400 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
            {{ post.excerpt }}
          </div>
        </div>

        <!-- Post content -->
        <div class="px-6 py-8">
          <div class="prose prose-lg max-w-none">
            <div
                v-if="post.content_raw"
                class="text-gray-800 leading-relaxed whitespace-pre-wrap"
                v-html="formatContent(post.content_raw)"
            >
            </div>
            <div v-else class="text-gray-500 italic text-center py-8">
              Контент посту відсутній
            </div>
          </div>
        </div>

        <!-- Post footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-500">
              Створено: {{ formatDate(post.created_at) }}
              <span v-if="post.updated_at !== post.created_at" class="ml-4">
                Оновлено: {{ formatDate(post.updated_at) }}
              </span>
            </div>

            <!-- Action buttons -->
            <div class="flex space-x-2">
              <NuxtLink
                  :to="`/blogpostui/${post.slug}/edit`"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Редагувати
              </NuxtLink>
              <button
                  @click="deletePost"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">Пост не знайдено</h3>
        <p class="text-gray-600 mb-6">Можливо, пост було видалено або URL неправильний</p>
        <NuxtLink
            to="/blogpostsui"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Повернутися до списку
        </NuxtLink>
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
  slug: string
}

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt?: string
  content_raw: string
  is_published: boolean
  published_at: string
  created_at: string
  updated_at: string
  user: User
  category: Category
}

const route = useRoute()
const router = useRouter()

const post = ref<BlogPost | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const postSlug = computed(() => route.params.slug as string)

const loadPost = async () => {
  loading.value = true
  error.value = null

  try {
    console.log(`Завантаження посту: ${postSlug.value}`)

    const response = await $fetch<BlogPost>(`http://localhost/api/blog/posts/${postSlug.value}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    console.log('Пост отримано:', response)
    post.value = response

  } catch (err: any) {
    console.error('Помилка API:', err)
    if (err.status === 404) {
      error.value = 'Пост не знайдено'
    } else {
      error.value = `Помилка завантаження посту: ${err.message}`
    }
    post.value = null
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

const formatContent = (content: string) => {
  if (!content) return ''

  // Простий форматер для перетворення переносів рядків в <br>
  return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
}

const deletePost = async () => {
  if (!post.value) return

  const confirmed = confirm(`Ви впевнені, що хочете видалити пост "${post.value.title}"?`)
  if (!confirmed) return

  try {
    await $fetch(`http://localhost/api/blog/posts/${post.value.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    alert('Пост успішно видалено!')
    router.push('/blogpostsui')
  } catch (err: any) {
    console.error('Помилка видалення:', err)
    alert(`Помилка видалення посту: ${err.message}`)
  }
}

// SEO and meta
useHead({
  title: computed(() => post.value ? `${post.value.title} - Блог` : 'Завантаження...'),
  meta: [
    {
      name: 'description',
      content: computed(() => post.value?.excerpt || 'Перегляд посту блогу')
    }
  ]
})

// Load post on mount and when slug changes
onMounted(() => {
  loadPost()
})

watch(() => route.params.slug, () => {
  if (route.params.slug) {
    loadPost()
  }
})
</script>

<style scoped>
.prose {
  color: #374151;
  line-height: 1.75;
}

.prose p {
  margin-bottom: 1.25em;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  color: #111827;
  font-weight: 600;
  margin-top: 2em;
  margin-bottom: 1em;
}

.prose h1 {
  font-size: 2.25em;
  line-height: 1.1111111;
}

.prose h2 {
  font-size: 1.875em;
  line-height: 1.3333333;
}

.prose h3 {
  font-size: 1.5em;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
}
</style>
