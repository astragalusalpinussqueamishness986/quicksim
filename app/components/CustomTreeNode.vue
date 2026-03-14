<template>
  <div class="ctree-node" :style="lineColorVar">
    <!-- Vertical line from parent -->
    <div class="ctree-stem" :class="lineClass" />

    <!-- Node card -->
    <div
      class="ctree-card"
      :class="[sentimentClass, linkedClass]"
    >
      <div v-if="linkedIds.has(node.id)" class="linked-pulse" />
      <span class="ctree-icon">{{ node.icon }}</span>
      <span class="ctree-text">{{ node.text }}</span>
      <span class="ctree-dot" :class="dotClass" />
      <span v-if="linkedIds.has(node.id)" class="link-badge" :title="linkMap.get(node.id) || '路径交叉'">🔗</span>
    </div>

    <!-- Children -->
    <div v-if="validChildren.length" class="ctree-children-wrap">
      <!-- Stem down from card -->
      <div class="ctree-stem-down" :class="lineClass" />

      <!-- Children row -->
      <div class="ctree-children" :class="{ 'single': validChildren.length === 1 }">
        <div
          v-for="(child, ci) in validChildren"
          :key="child.id"
          class="ctree-child"
        >
          <CustomTreeNode
            :node="child"
            :branch-color="branchColor"
            :linked-ids="linkedIds"
            :link-map="linkMap"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TreeNode } from '~/types'

const props = defineProps<{
  node: TreeNode
  branchColor: string
  linkedIds: Set<string>
  linkMap: Map<string, string>
}>()

const validChildren = computed(() => {
  if (!props.node.children || !Array.isArray(props.node.children)) return []
  return props.node.children.filter((c: any) => c && typeof c === 'object' && c.id)
})

const sentimentClass = computed(() => {
  switch (props.node.sentiment) {
    case 'positive': return 'card-pos'
    case 'negative': return 'card-neg'
    default: return 'card-neu'
  }
})

const linkedClass = computed(() =>
  props.linkedIds.has(props.node.id) ? 'card-linked' : ''
)

const dotClass = computed(() => {
  switch (props.node.sentiment) {
    case 'positive': return 'dot-pos'
    case 'negative': return 'dot-neg'
    default: return 'dot-neu'
  }
})

const lineClass = computed(() => {
  if (props.branchColor === 'cyan') return 'line-cyan'
  if (props.branchColor === 'amber') return 'line-amber'
  return 'line-default'
})

const lineColorVar = computed(() => {
  if (props.branchColor === 'cyan') return { '--line-color': 'rgba(34,211,238,0.3)' }
  if (props.branchColor === 'amber') return { '--line-color': 'rgba(251,191,36,0.3)' }
  return { '--line-color': 'rgba(148,163,184,0.2)' }
})
</script>

<style scoped>
.ctree-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: nodeIn 0.35s ease-out both;
}
@keyframes nodeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Vertical connector from parent to this node */
.ctree-stem {
  width: 2px;
  height: 22px;
  flex-shrink: 0;
}

/* Stem from card down to children */
.ctree-stem-down {
  width: 2px;
  height: 22px;
  margin: 0 auto;
  flex-shrink: 0;
}

/* Node card */
.ctree-card {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  font-size: 12px;
  color: #cbd5e1;
  white-space: nowrap;
  position: relative;
  transition: all 0.2s;
  max-width: 180px;
}
.ctree-card:hover {
  transform: scale(1.04);
  z-index: 5;
}
.ctree-icon { font-size: 14px; flex-shrink: 0; }
.ctree-text { overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }

/* Sentiment styles */
.card-pos { border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.06); color: #a7f3d0; }
.card-pos:hover { box-shadow: 0 0 12px rgba(52,211,153,0.12); }
.card-neg { border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.06); color: #fca5a5; }
.card-neg:hover { box-shadow: 0 0 12px rgba(248,113,113,0.12); }
.card-neu { border-color: rgba(148,163,184,0.2); background: rgba(148,163,184,0.04); }

/* Linked node glow */
.card-linked {
  box-shadow: 0 0 0 2px rgba(167,139,250,0.3), 0 0 16px rgba(167,139,250,0.1);
  border-color: rgba(167,139,250,0.4) !important;
}
.linked-pulse {
  position: absolute; inset: -3px; border-radius: 11px;
  border: 2px dashed rgba(167,139,250,0.35);
  animation: pulse 2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes pulse {
  0%,100% { opacity: 0.3; } 50% { opacity: 0.7; }
}
.link-badge {
  position: absolute; top: -8px; right: -8px;
  width: 16px; height: 16px; font-size: 9px;
  background: rgba(124,58,237,0.85); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

/* Sentiment dots */
.ctree-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.dot-pos { background: #34d399; box-shadow: 0 0 4px #34d399; }
.dot-neg { background: #f87171; box-shadow: 0 0 4px #f87171; }
.dot-neu { background: #64748b; }

/* Line colors */
.line-cyan { background: rgba(34,211,238,0.3); }
.line-amber { background: rgba(251,191,36,0.3); }
.line-default { background: rgba(148,163,184,0.2); }

/* Children layout */
.ctree-children-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.ctree-children {
  display: flex;
  justify-content: center;
  gap: 8px;
  position: relative;
}
.ctree-children.single {
  gap: 0;
}

/* Horizontal rail connecting siblings */
.ctree-children:not(.single) > .ctree-child:not(:only-child)::before {
  content: '';
  position: absolute;
  top: 0;
  height: 2px;
  background: var(--line-color, rgba(148,163,184,0.2));
}
.ctree-children:not(.single) > .ctree-child:first-child::before {
  left: 50%; width: 50%;
}
.ctree-children:not(.single) > .ctree-child:last-child::before {
  right: 50%; width: 50%; left: auto;
}
.ctree-children:not(.single) > .ctree-child:not(:first-child):not(:last-child)::before {
  left: 0; width: 100%;
}
</style>
