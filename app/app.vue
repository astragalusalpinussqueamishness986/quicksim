<template>
  <div class="min-h-screen text-content">
    <NuxtRouteAnnouncer />
    <header class="border-b border-line backdrop-blur-sm bg-surface/80">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold">
          <span class="text-2xl">⚡</span>
          <span class="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">QuickSim</span>
        </NuxtLink>
        <div class="flex items-center gap-3">
          <p class="text-sm text-content-muted hidden sm:block">AI 人生场景速推</p>
          <button
            @click="toggleTheme"
            class="p-2 rounded-lg border border-line hover:border-line-hover hover:bg-surface-hover transition-all text-lg"
            :title="$colorMode.value === 'dark' ? '切换到亮色' : '切换到暗色'"
          >
            {{ $colorMode.value === 'dark' ? '🌙' : '☀️' }}
          </button>
        </div>
      </div>
    </header>
    <main class="max-w-5xl mx-auto px-4 py-8">
      <NuxtPage />
    </main>
    <footer class="border-t border-line text-center py-6 text-sm text-content-muted">
      QuickSim — 用 AI 推演你的人生选择
    </footer>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
