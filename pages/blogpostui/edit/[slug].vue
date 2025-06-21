<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center gap-4 mb-6">
      <UButton
          :to="post ? `/blogpostui/${post.slug}` : '/blogpostui'"
          variant="ghost"
          icon="i-heroicons-arrow-left"
      >
        Назад
      </UButton>
      <h1 class="text-3xl font-bold">Редагувати пост</h1>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin w-8 h-8" />
    </div>

    <UAlert
        v-else-if="error"
        color="red"
        variant="solid"
        :title="error"
        class="mb-6"
    />

    <UCard v-else-if="post">
      <template #header>
        <h2 class="text-xl font-semibold">Редагувати "{{ post.title }}"</h2>
      </template>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Заголовок *
            </label>
            <UInput
                v-model="state.title"
                placeholder="Введіть заголовок посту"
                required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <UInput
                v-model="state.slug"
                placeholder="post-slug"
                required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Категорія *
            </label>
            <select
                v-model="state.category_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                :disabled="loadingCategories"
            >
              <option value="" disabled>Оберіть категорію</option>
              <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
              >
                {{ category.title }}
              </option>
            </select>
            <div v-if="loadingCategories" class="text-sm text-gray-500 mt-1">
              Завантаження категорій...
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Публікація
            </label>
            <div class="space-y-3">
              <UCheckbox
                  v-model="state.is_published"
                  label="Опублікувати"
                  @change="handlePublishChange"
              />

              <div v-if="state.is_published">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Дата публікації
                </label>
                <UInput
                    v-model="publishedAtFormatted"
                    type="datetime-local"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Короткий опис
          </label>
          <UTextarea
              v-model="state.excerpt"
              placeholder="Короткий опис посту для превью"
              :rows="3"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Контент *
          </label>
          <UTextarea
              v-model="state.content_raw"
              placeholder="Напишіть контент посту тут..."
              :rows="12"
              required
          />
        </div>

        <div class="flex justify-end gap-4">
          <UButton
              :to="`/blogpostui/${post.slug}`"
              variant="ghost"
              type="button"
          >
            Скасувати
          </UButton>
          <UButton
              type="submit"
              :loading="submitting"
          >
            Оновити пост
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt?: string
  content_raw: string
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
  user: any
  category: any
}

interface BlogCategory {
  id: number
  title: string
  slug: string
}

const route = useRoute()
const router = useRouter()

const postSlug = computed(() => route.params.slug as string)

const post = ref<BlogPost | null>(null)
const categories = ref<BlogCategory[]>([])
const loading = ref(true)
const submitting = ref(false)
const loadingCategories = ref(false)
const error = ref<string | null>(null)

const state = reactive({
  title: '',
  slug: '',
  category_id: '',
  excerpt: '',
  content_raw: '',
  is_published: false,
  published_at: ''
})

const publishedAtFormatted = computed({
  get() {
    if (!state.published_at) return ''
    try {
      const date = new Date(state.published_at)
      return date.toISOString().slice(0, 16)
    } catch {
      return ''
    }
  },
  set(value: string) {
    if (value) {
      state.published_at = new Date(value).toISOString()
    } else {
      state.published_at = ''
    }
  }
})

const handlePublishChange = () => {
  if (state.is_published && !state.published_at) {
    state.published_at = new Date().toISOString()
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

    // Fill form with post data
    state.title = postData.title
    state.slug = postData.slug
    state.category_id = postData.category.id.toString()
    state.excerpt = postData.excerpt || ''
    state.content_raw = postData.content_raw
    state.is_published = postData.is_published
    state.published_at = postData.published_at || ''

  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Сталася помилка'
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (!post.value) return

  submitting.value = true
  try {
    const submitData = {
      ...state,
      category_id: Number(state.category_id)
    }

    const updatedPost = await $fetch<BlogPost>(`http://localhost/api/blog/posts/${post.value.id}`, {
      method: 'PUT',
      body: submitData
    })

    await router.push(`/blogpostui/${updatedPost.slug}`)
  } catch (error) {
    console.error('Помилка оновлення посту:', error)
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
