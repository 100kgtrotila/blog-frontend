<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Блог Адмін</h1>
        </div>

        <div class="space-y-4">
          <NuxtLink
              to="/blogpostui/blogpostsui"
              class="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
          >
            <div class="flex items-center justify-center space-x-2">
              <span>📝</span>
              <span>Пости</span>
            </div>
            <p class="text-sm text-blue-100 mt-1">Управління постами блогу</p>
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
import { useHead } from '#app';

useHead({
  title: 'Блог Адмін - Головна'
})
</script>
