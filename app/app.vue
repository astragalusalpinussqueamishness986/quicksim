<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
    <NuxtRouteAnnouncer />
    <header class="border-b border-white/10 backdrop-blur-sm">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold">
          <span class="text-2xl">⚡</span>
          <span class="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">QuickSim</span>
        </NuxtLink>
        <p class="text-sm text-slate-400 hidden sm:block">AI 人生场景速推</p>
      </div>
    </header>
    <main class="max-w-5xl mx-auto px-4 py-8">
      <NuxtPage />
    </main>
    <footer class="border-t border-white/10 text-center py-6 text-sm text-slate-500">
      QuickSim — 用 AI 推演你的人生选择
    </footer>
  </div>
</template>
