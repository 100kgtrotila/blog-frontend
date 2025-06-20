<template>
  <div>
    <Head>
      <Title>Блог Пости</Title>
    </Head>

    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4">
          <h1 class="text-3xl font-bold text-gray-900">Управління блог-постами</h1>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6">
        <PostsTableComponent />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';

definePageMeta({
  title: 'Блог Пости'
})
</script>
