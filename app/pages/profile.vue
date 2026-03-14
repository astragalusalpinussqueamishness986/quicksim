<template>
  <div>
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-slate-400 hover:text-white mb-6 transition-colors">
      ← 返回首页
    </NuxtLink>

    <div class="flex items-center gap-3 mb-8">
      <span class="text-4xl">🧠</span>
      <div>
        <h1 class="text-2xl font-bold">我的决策画像</h1>
        <p class="text-slate-400">AI 从你的每次决策中学习你的特征</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-8" v-if="profile">
      <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
        <p class="text-3xl font-bold text-white">{{ profile.decisionCount }}</p>
        <p class="text-xs text-slate-500 mt-1">决策次数</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
        <p class="text-3xl font-bold text-white">{{ traitCount }}</p>
        <p class="text-xs text-slate-500 mt-1">画像标签</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
        <p class="text-3xl font-bold text-white">{{ categoryCount }}</p>
        <p class="text-xs text-slate-500 mt-1">维度覆盖</p>
      </div>
    </div>

    <!-- Knowledge Graph -->
    <div v-if="profile" class="mb-8">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-lg">🕸️</span>
        <h2 class="text-base font-semibold text-white">知识图谱</h2>
        <span class="text-xs text-slate-500">特征关系网络</span>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <ClientOnly>
          <KnowledgeGraph />
          <template #fallback>
            <div class="flex items-center justify-center h-[420px]">
              <span class="animate-spin text-2xl">⏳</span>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="profile && traitCount === 0" class="text-center py-16">
      <p class="text-6xl mb-4">🌱</p>
      <p class="text-lg text-slate-300">画像还是空白的</p>
      <p class="text-sm text-slate-500 mt-2">去<NuxtLink to="/tree" class="text-emerald-400 hover:underline">决策树</NuxtLink>提问几个问题，AI 会自动学习你的特征</p>
    </div>

    <!-- Trait cards by category -->
    <div v-if="profile && traitCount > 0" class="space-y-6">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-base font-semibold text-white">🏷️ 画像标签</h2>
        <button
          @click="showAddForm = !showAddForm"
          class="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 transition-all"
        >
          + 手动添加
        </button>
      </div>

      <!-- Add Trait Form -->
      <Transition name="slide">
        <div v-if="showAddForm" class="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 space-y-3">
          <div class="grid grid-cols-3 gap-3">
            <select v-model="newTrait.category" class="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="basic">👤 基本信息</option>
              <option value="career">💼 职业发展</option>
              <option value="values">💎 价值观</option>
              <option value="preferences">🎯 偏好特征</option>
              <option value="life">🏠 生活状况</option>
            </select>
            <input v-model="newTrait.key" placeholder="标签名（如：年龄）" class="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" />
            <input v-model="newTrait.value" placeholder="值（如：25岁）" class="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" />
          </div>
          <div class="flex justify-end gap-2">
            <button @click="showAddForm = false" class="text-xs px-3 py-1.5 text-slate-400 hover:text-white">取消</button>
            <button @click="handleAddTrait" :disabled="!newTrait.key || !newTrait.value" class="text-xs px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">添加</button>
          </div>
        </div>
      </Transition>

      <div
        v-for="(traits, category) in profile.traits"
        :key="category"
        class="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
      >
        <div class="flex items-center gap-2 mb-4">
          <span class="text-lg">{{ categoryIcon(category as string) }}</span>
          <h2 class="text-base font-semibold text-white">{{ categoryLabel(category as string) }}</h2>
          <span class="text-xs text-slate-500">({{ (traits as any[]).length }})</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="trait in (traits as any[])"
            :key="trait.id"
            class="group relative px-3 py-2 rounded-xl border transition-all cursor-pointer"
            :class="[
              confidenceClass(trait.confidence),
              editingTrait?.id === trait.id ? 'ring-1 ring-cyan-400/50' : ''
            ]"
            @click="startEdit(trait)"
          >
            <!-- Normal display -->
            <template v-if="editingTrait?.id !== trait.id">
              <span class="text-xs text-slate-400">{{ trait.key }}</span>
              <span class="text-sm font-medium text-white ml-1">{{ trait.value }}</span>
              <!-- Edit hint on hover -->
              <span class="text-[10px] text-slate-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
            </template>
            <!-- Editing mode -->
            <template v-else>
              <span class="text-xs text-cyan-400">{{ trait.key }}:</span>
              <input
                v-model="editingValue"
                @click.stop
                @keydown.enter="saveEdit(trait)"
                @keydown.escape="cancelEdit"
                class="bg-transparent border-b border-cyan-400/50 text-sm font-medium text-white ml-1 outline-none min-w-[5em]"
                :style="{ width: (editingValue.length + 2) + 'em' }"
                ref="editInput"
                autofocus
              />
              <span class="inline-flex items-center gap-3 ml-3">
                <button @click.stop="saveEdit(trait)" class="text-xs px-1.5 py-0.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors" title="保存">✓ 保存</button>
                <button @click.stop="confirmDelete(trait)" class="text-xs px-1.5 py-0.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors" title="删除">✕ 删除</button>
              </span>
            </template>
            <!-- Confidence bar -->
            <div class="absolute bottom-0 left-0 h-0.5 rounded-full bg-emerald-500/50" :style="{ width: (trait.confidence * 100) + '%' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Decision History -->
    <div v-if="profile?.decisions?.length" class="mt-8">
      <h2 class="text-base font-semibold text-white mb-4">📜 决策历史</h2>
      <div class="space-y-2">
        <div
          v-for="d in (profile.decisions as any[])"
          :key="d.id"
          class="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-white/10 transition-colors"
        >
          <span class="text-xs text-slate-500 shrink-0">{{ formatDate(d.created_at) }}</span>
          <span class="text-sm text-slate-300 flex-1 truncate">{{ d.question }}</span>
          <span v-if="d.choice_a && d.choice_b" class="text-xs text-slate-500 shrink-0">
            {{ d.choice_a }} vs {{ d.choice_b }}
          </span>
          <button
            @click="confirmDeleteDecision(d)"
            class="text-xs text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
            title="删除此决策记录"
          >✕</button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="!profile" class="text-center py-16">
      <span class="animate-spin inline-block">⏳</span>
      <p class="text-sm text-slate-500 mt-2">加载中...</p>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click="deleteConfirm = null">
          <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl" @click.stop>
            <p class="text-lg font-semibold text-white mb-2">确认删除</p>
            <p class="text-sm text-slate-400 mb-1">{{ deleteConfirm.message }}</p>
            <p v-if="deleteConfirm.detail" class="text-xs text-slate-500 mb-5">{{ deleteConfirm.detail }}</p>
            <div class="flex justify-end gap-3 mt-5">
              <button @click="deleteConfirm = null" class="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">取消</button>
              <button @click="executeConfirmedDelete" class="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors">删除</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const profile = ref<any>(null)
const editingTrait = ref<any>(null)
const editingValue = ref('')
const showAddForm = ref(false)
const deleteConfirm = ref<{ type: string; id: number; message: string; detail?: string } | null>(null)
const newTrait = reactive({ category: 'basic', key: '', value: '' })

const traitCount = computed(() => {
  if (!profile.value?.traits) return 0
  return Object.values(profile.value.traits).reduce((sum: number, arr: any) => sum + arr.length, 0)
})

const categoryCount = computed(() => {
  if (!profile.value?.traits) return 0
  return Object.keys(profile.value.traits).length
})

async function loadProfile() {
  try {
    profile.value = await $fetch('/api/profile')
  } catch {
    profile.value = { traits: {}, decisions: [], decisionCount: 0, summary: '' }
  }
}

onMounted(loadProfile)

function startEdit(trait: any) {
  editingTrait.value = trait
  editingValue.value = trait.value
}

function cancelEdit() {
  editingTrait.value = null
  editingValue.value = ''
}

async function saveEdit(trait: any) {
  if (!editingValue.value.trim()) return
  try {
    await $fetch('/api/profile-trait', {
      method: 'POST',
      body: { action: 'update', id: trait.id, value: editingValue.value.trim() },
    })
    trait.value = editingValue.value.trim()
    trait.confidence = 1.0
    cancelEdit()
    await loadProfile()
  } catch (e) {
    console.error('Update failed:', e)
  }
}

function confirmDelete(trait: any) {
  deleteConfirm.value = {
    type: 'trait',
    id: trait.id,
    message: `确定要删除标签「${trait.key}」吗？`,
    detail: `当前值：${trait.value}`,
  }
}

function confirmDeleteDecision(d: any) {
  deleteConfirm.value = {
    type: 'decision',
    id: d.id,
    message: `确定要删除决策记录吗？`,
    detail: d.question + (d.choice_a && d.choice_b ? ` (${d.choice_a} vs ${d.choice_b})` : ''),
  }
}

async function executeConfirmedDelete() {
  if (!deleteConfirm.value) return
  const { type, id } = deleteConfirm.value
  try {
    await $fetch('/api/profile-trait', {
      method: 'POST',
      body: { action: type === 'decision' ? 'delete_decision' : 'delete', id },
    })
    deleteConfirm.value = null
    cancelEdit()
    await loadProfile()
  } catch (e) {
    console.error('Delete failed:', e)
  }
}

async function handleAddTrait() {
  if (!newTrait.key.trim() || !newTrait.value.trim()) return
  try {
    await $fetch('/api/profile-trait', {
      method: 'POST',
      body: { action: 'add', category: newTrait.category, key: newTrait.key.trim(), value: newTrait.value.trim() },
    })
    newTrait.key = ''
    newTrait.value = ''
    showAddForm.value = false
    await loadProfile()
  } catch (e) {
    console.error('Add failed:', e)
  }
}

function categoryIcon(cat: string) {
  const icons: Record<string, string> = {
    basic: '👤',
    career: '💼',
    values: '💎',
    preferences: '🎯',
    life: '🏠',
  }
  return icons[cat] || '📌'
}

function categoryLabel(cat: string) {
  const labels: Record<string, string> = {
    basic: '基本信息',
    career: '职业发展',
    values: '价值观',
    preferences: '偏好特征',
    life: '生活状况',
  }
  return labels[cat] || cat
}

function confidenceClass(confidence: number) {
  if (confidence >= 0.7) return 'border-emerald-500/30 bg-emerald-500/[0.05]'
  if (confidence >= 0.4) return 'border-amber-500/20 bg-amber-500/[0.03]'
  return 'border-white/5 bg-white/[0.02]'
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
