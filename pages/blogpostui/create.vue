<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center gap-4 mb-6">
      <UButton
          to="/blogpostui"
          variant="ghost"
          icon="i-heroicons-arrow-left"
      >
        Назад
      </UButton>
      <h1 class="text-3xl font-bold">Створити новий пост</h1>
    </div>

    <UCard>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Заголовок *
            </label>
            <UInput
                v-model="state.title"
                placeholder="Введіть заголовок посту"
                @input="generateSlug"
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
                  label="Опублікувати зараз"
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

        <div class="flex justify-end gap-3 pt-4">
          <UButton
              to="/blogpostui"
              variant="ghost"
              type="button"
          >
            Скасувати
          </UButton>
          <UButton
              type="submit"
              :loading="submitting"
          >
            Створити пост
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { z } from "zod"

const postSchema = z.object({
  title: z.string().min(1, "Заголовок обов'язковий").max(255, "Заголовок занадто довгий"),
  slug: z.string().min(1, "Slug обов'язковий").max(255, "Slug занадто довгий"),
  category_id: z.string().optional(), // Додано .optional()
  excerpt: z.string().max(500, "Короткий опис занадто довгий").optional().or(z.literal("")),
  content_raw: z.string().min(1, "Контент обов'язковий"),
  is_published: z.boolean(),
  published_at: z.string().optional().or(z.literal("")),
})

type PostFormData = z.infer<typeof postSchema>

interface BlogCategory {
  id: number
  title: string
  slug: string
}

const router = useRouter()

const state = reactive<PostFormData>({
  title: '',
  slug: '',
  category_id: '', // Змінено на порожній рядок
  excerpt: '',
  content_raw: '',
  is_published: false,
  published_at: ''
})

const categories = ref<BlogCategory[]>([])
const submitting = ref(false)
const loadingCategories = ref(false)

const categoryOptions = computed(() =>
    categories.value.map(cat => ({
      label: cat.title,
      value: cat.id
    }))
)

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

const generateSlug = () => {
  if (state.title && !state.slug) {
    state.slug = state.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
  }
}

const handlePublishChange = () => {
  if (state.is_published && !state.published_at) {
    state.published_at = new Date().toISOString()
  }
}

const loadCategories = async () => {
  loadingCategories.value = true
  try {
    console.log('Завантажуємо категорії...')
    const response = await $fetch<BlogCategory[]>('http://localhost/api/blog/categories-all')
    console.log('Отримані категорії:', response)
    categories.value = response
  } catch (error) {
    console.error('Помилка завантаження категорій:', error)
  } finally {
    loadingCategories.value = false
  }
}

const onSubmit = async () => {
  // Перевірка обов'язкових полів
  if (!state.title || !state.slug || !state.category_id || !state.content_raw) {
    console.error('Заповніть всі обов\'язкові поля')
    return
  }

  submitting.value = true
  try {
    const submitData = {
      ...state,
      category_id: Number(state.category_id) // Перетворюємо в число
    }

    const response = await $fetch('http://localhost/api/blog/posts', {
      method: 'POST',
      body: submitData
    })

    await router.push(`/blogpostui/${response.slug}`)
  } catch (error) {
    console.error('Помилка створення посту:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadCategories()
})

useHead({
  title: 'Створити новий пост'
})
</script>
