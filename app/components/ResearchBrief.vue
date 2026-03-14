<template>
  <!-- AI Brief result -->
  <div v-if="data" class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4 animate-slide-in">
    <div class="flex items-center gap-2 text-sm text-slate-400">
      <span>📋</span>
      <span class="font-medium">AI 调研简报</span>
      <span class="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">Skill</span>
    </div>

    <!-- Brief text -->
    <p class="text-sm text-slate-200 leading-relaxed">{{ data.brief }}</p>

    <!-- Key Factors -->
    <div v-if="data.keyFactors?.length" class="flex flex-wrap gap-2">
      <span
        v-for="factor in data.keyFactors"
        :key="factor"
        class="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 border border-white/5"
      >💡 {{ factor }}</span>
    </div>

    <!-- Wiki/Baike data (fetched after brief) -->
    <div v-if="wikiData?.articles?.length" class="space-y-2 pt-2 border-t border-white/5">
      <p class="text-xs text-slate-500">百科参考</p>
      <div
        v-for="article in wikiData.articles"
        :key="article.keyword"
        class="rounded-lg bg-white/[0.02] border border-white/5 p-3"
      >
        <div class="flex items-center gap-2 mb-1">
          <span class="text-sm font-medium text-white">{{ article.keyword }}</span>
          <span class="text-xs text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{{ article.source }}</span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed line-clamp-3">{{ article.summary }}</p>
      </div>
    </div>
  </div>

  <!-- Loading state -->
  <div v-else-if="loading" class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <div class="flex items-center gap-2 text-sm text-slate-400">
      <span class="inline-block animate-pulse">📋</span>
      <span>{{ loadingText || '正在分析问题...' }}</span>
      <span class="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">Skill</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: any | null
  wikiData?: any | null
  loading: boolean
  loadingText?: string
}>()
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.4s ease-out;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
