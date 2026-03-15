<template>
  <div>
    <!-- Hero: Google-style search -->
    <section class="text-center pt-8 pb-6">
      <!-- Profile link -->
      <div class="flex justify-end mb-2">
        <NuxtLink to="/profile" class="flex items-center gap-1.5 text-sm text-content-secondary hover:text-content transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-hover">
          <span>🧠</span>
          <span>我的画像</span>
        </NuxtLink>
      </div>

      <h1 class="text-4xl sm:text-5xl font-bold mb-3">
        <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          QuickSim
        </span>
      </h1>
      <p class="text-base text-content-secondary mb-8">输入一个选择题，AI 为你推导每条路的连锁结果</p>

      <!-- Search bar -->
      <form class="max-w-2xl mx-auto" @submit.prevent="goTree">
        <div class="relative group">
          <span class="absolute left-5 top-1/2 -translate-y-1/2 text-xl pointer-events-none">🌳</span>
          <input
            v-model="query"
            type="text"
            placeholder="例如：该不该裸辞去创业、要不要考研、现在买房还是等..."
            class="w-full pl-14 pr-28 py-4 rounded-2xl bg-surface-card border border-line text-content text-base placeholder-content-muted focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
          <button
            type="submit"
            :disabled="!query.trim()"
            class="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 disabled:opacity-30 transition-all"
          >
            推导 →
          </button>
        </div>
      </form>

      <!-- Quick examples -->
      <div class="flex flex-wrap justify-center gap-2 mt-4">
        <button
          v-for="example in examples"
          :key="example"
          class="text-xs px-3 py-1.5 rounded-full border border-line text-content-secondary hover:text-content hover:border-line-hover hover:bg-surface-hover transition-all"
          @click="quickFill(example)"
        >
          {{ example }}
        </button>
      </div>
    </section>

    <!-- Divider -->
    <div class="flex items-center gap-4 my-8 max-w-2xl mx-auto">
      <div class="flex-1 h-[1px] bg-line" />
      <span class="text-xs text-content-muted uppercase tracking-wider">或选择预设场景</span>
      <div class="flex-1 h-[1px] bg-line" />
    </div>

    <!-- Preset scenario cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
      <NuxtLink
        v-for="s in scenarios"
        :key="s.id"
        :to="`/sim/${s.id}`"
        class="group relative overflow-hidden rounded-xl border border-line bg-surface-card p-4 transition-all hover:border-line-hover hover:bg-surface-hover hover:scale-[1.02]"
      >
        <div class="text-2xl mb-2">{{ s.icon }}</div>
        <h2 class="text-sm font-semibold mb-0.5">{{ s.name }}</h2>
        <p class="text-xs text-content-muted line-clamp-1">{{ s.description }}</p>
        <div
          class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl bg-gradient-to-br"
          :class="s.color"
        />
      </NuxtLink>

      <!-- Custom -->
      <NuxtLink
        to="/custom"
        class="group relative overflow-hidden rounded-xl border border-dashed border-line bg-surface-card p-4 transition-all hover:border-line-hover hover:bg-surface-hover hover:scale-[1.02] flex flex-col items-center justify-center text-center"
      >
        <div class="text-2xl mb-2">🎨</div>
        <h2 class="text-sm font-semibold">自定义对比</h2>
      </NuxtLink>
    </div>

    <section class="mt-12 text-center text-xs text-content-faint">
      <p>💡 所有推演基于公开数据 + AI 分析，仅供参考</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { scenarios } from '~/scenarios'

const query = ref('')
const router = useRouter()

const examples = [
  '25岁要不要生孩子',
  '该不该裸辞去创业',
  '留学还是国内考研',
  '现在买房还是继续租房',
]

function goTree() {
  if (query.value.trim()) {
    router.push({ path: '/tree', query: { q: query.value.trim() } })
  }
}

function quickFill(text: string) {
  query.value = text
  goTree()
}
</script>
