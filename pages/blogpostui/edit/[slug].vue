<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4">
        <div class="flex items-center space-x-4">
          <NuxtLink
              :to="post ? `/blogpostui/${post.slug}` : '/blogpostui/blogposts'"
              class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Назад
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900">Редагувати пост</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto py-6 px-4">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-3">Завантаження...</span>
      </div>

      <div v-else-if="error" class="text-red-500 p-4 bg-red-50 rounded">
        <h3 class="font-medium">Помилка завантаження</h3>
        <p class="mt-1">{{ error }}</p>
        <button @click="loadData" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Спробувати знову
        </button>
      </div>

      <div v-else-if="post" class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-6">Редагувати "{{ post.title }}"</h2>

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
              />
              <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title[0] }}</p>
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
              <p v-if="errors.slug" class="mt-1 text-sm text-red-600">{{ errors.slug[0] }}</p>
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
              <p v-if="errors.category_id" class="mt-1 text-sm text-red-600">{{ errors.category_id[0] }}</p>
            </div>

            <div>
              <label class="flex items-center space-x-2 mb-2">
                <input
                    v-model="formData.is_published"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    @change="handlePublishChange"
                />
                <span class="text-sm font-medium text-gray-700">Опублікувати</span>
              </label>
              <div v-if="formData.is_published">
                <input
                    v-model="formattedPublishedAt"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Дата публікації"
                />
                <p class="mt-1 text-sm text-gray-500">
                  Дата публікації: {{ formatDateForDisplay(formData.published_at) }}
                </p>
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
            <p v-if="errors.excerpt" class="mt-1 text-sm text-red-600">{{ errors.excerpt[0] }}</p>
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
            <p v-if="errors.content_raw" class="mt-1 text-sm text-red-600">{{ errors.content_raw[0] }}</p>
          </div>

          <div class="flex justify-end space-x-4">
            <NuxtLink
                :to="`/blogpostui/${post.slug}`"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Скасувати
            </NuxtLink>
            <button
                type="submit"
                :disabled="submitting"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ submitting ? 'Оновлення...' : 'Оновити пост' }}
            </button>
          </div>
        </form>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-600">Пост не знайдено</p>
        <NuxtLink to="/blogpostui/blogpostsui" class="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Повернутися до списку
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import type { BlogPost, BlogCategory } from '~/types'

// Ви можете додати валідацію Zod або іншу, якщо потрібно
interface PostFormData {
  title: string
  slug: string
  category_id: number | null
  excerpt: string
  content_raw: string
  is_published: boolean
  published_at: string | null
}

const route = useRoute()
const router = useRouter()

const postSlug = computed(() => route.params.slug as string)

const post = ref<BlogPost | null>(null)
const categories = ref<BlogCategory[]>([])
const loading = ref(true)
const submitting = ref(false)
const error = ref<string | null>(null)
const errors = ref<Record<string, any>>({})

const formData = reactive<PostFormData>({
  title: '',
  slug: '',
  category_id: null,
  excerpt: '',
  content_raw: '',
  is_published: false,
  published_at: null
})

const formattedPublishedAt = computed({
  get() {
    if (!formData.published_at) return ''
    try {
      const date = new Date(formData.published_at)
      if (isNaN(date.getTime())) return ''
      // Повертаємо дату у форматі, який розуміє <input type="datetime-local">
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
    } catch {
      return ''
    }
  },
  set(value: string) {
    if (value) {
      formData.published_at = new Date(value).toISOString()
    } else {
      formData.published_at = null
    }
  }
})

const formatDateForDisplay = (dateString: string | null) => {
  if (!dateString) return 'не встановлено'
  try {
    return new Date(dateString).toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'невірна дата'
  }
}

const handlePublishChange = () => {
  if (formData.is_published) {
    if (!formData.published_at) {
      formData.published_at = new Date().toISOString()
    }
  } else {
    formData.published_at = null
  }
}

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    const [postData, categoriesData] = await Promise.all([
      $fetch<BlogPost>(`http://localhost/api/blog/posts/${postSlug.value}`),
      $fetch<BlogCategory[]>('http://localhost/api/blog/categories-all')
    ])

    post.value = postData
    categories.value = categoriesData

    formData.title = postData.title
    formData.slug = postData.slug
    formData.category_id = postData.category.id
    formData.excerpt = postData.excerpt || ''
    formData.content_raw = postData.content_raw
    formData.is_published = postData.is_published
    formData.published_at = postData.published_at

  } catch (err: any) {
    console.error('Помилка завантаження:', err)
    error.value = err.data?.message || err.message || 'Сталася помилка'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!post.value) return;

  submitting.value = true
  errors.value = {}

  try {
    const updatedPost = await $fetch<BlogPost>(`http://localhost/api/blog/posts/${post.value.id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: formData
    })

    alert('Пост оновлено успішно!')
    router.push(`/blogpostui/${updatedPost.slug}`)

  } catch (err: any) {
    console.error('Помилка оновлення посту:', err)
    if (err.status === 422) {
      errors.value = err.data.errors
      alert('Помилка валідації. Перевірте заповнення полів.');
    } else {
      alert(`Сталася помилка: ${err.data?.message || err.message}`)
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})

useHead({
  title: computed(() => post.value ? `Редагувати: ${post.value.title}` : 'Редагувати пост')
})
</script>