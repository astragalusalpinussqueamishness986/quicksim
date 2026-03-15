<template>
  <div class="decision-tree-viz">
    <!-- Custom HTML Tree -->
    <div class="custom-tree">
      <!-- Root question -->
      <div class="tree-root">
        <div class="node-card node-root">
          <span>🤔</span> {{ data.question }}
        </div>
      </div>

      <!-- Stem from root -->
      <div class="tree-stem bg-indigo-500/30" />

      <!-- Branch rail -->
      <div class="branch-level">
        <div
          v-for="(branch, bi) in data.branches"
          :key="bi"
          class="branch-column"
        >
          <!-- Vertical line up to rail -->
          <div class="branch-connector" :class="bi === 0 ? 'line-cyan' : 'line-amber'" />
          <!-- Branch header -->
          <div class="node-card" :class="bi === 0 ? 'node-cyan' : 'node-amber'">
            <span>{{ branch.icon }}</span> <strong>{{ branch.choice }}</strong>
          </div>
          <!-- Recursive children -->
          <div v-for="rootNode in validNodes(branch.nodes)" :key="rootNode.id" class="subtree">
            <CustomTreeNode
              :node="rootNode"
              :branch-color="branch.color"
              :linked-ids="linkedNodeIds"
              :link-map="linkMap"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Cross-link Legend -->
    <div v-if="data.links?.length" class="mt-6 flex flex-col items-center gap-3">
      <p class="text-xs text-content-muted uppercase tracking-wider">🔗 路径交叉点</p>
      <div class="flex flex-col gap-2 max-w-lg">
        <div
          v-for="(link, i) in resolvedLinks"
          :key="i"
          class="flex items-center gap-3 px-4 py-2 rounded-xl bg-purple-500/[0.08] border border-purple-500/20"
        >
          <span class="text-xs px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 whitespace-nowrap">{{ link.fromText }}</span>
          <span class="text-purple-400 text-xs flex-shrink-0">⟷</span>
          <span class="text-xs px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/20 whitespace-nowrap">{{ link.toText }}</span>
          <span class="text-xs text-purple-300/60 ml-auto">{{ link.reason }}</span>
        </div>
      </div>
    </div>

    <!-- Insight Card -->
    <div v-if="data.insight" class="mt-6 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 p-5">
      <div class="flex items-start gap-3">
        <span class="text-2xl">💡</span>
        <div>
          <p class="text-sm text-indigo-400 font-medium mb-1">路径洞察</p>
          <p class="text-content font-semibold">{{ data.insight }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DecisionTreeResponse, TreeNode } from '~/types'

const props = defineProps<{
  data: DecisionTreeResponse
}>()

const linkedNodeIds = computed(() => {
  const ids = new Set<string>()
  props.data.links?.forEach(link => { ids.add(link.fromId); ids.add(link.toId) })
  return ids
})

const linkMap = computed(() => {
  const map = new Map<string, string>()
  props.data.links?.forEach(link => {
    map.set(link.fromId, link.reason)
    map.set(link.toId, link.reason)
  })
  return map
})

function collectNodes(nodes: TreeNode[], map: Map<string, string>) {
  for (const n of nodes) {
    map.set(n.id, n.text)
    if (n.children && Array.isArray(n.children)) collectNodes(n.children, map)
  }
}

const nodeTextMap = computed(() => {
  const map = new Map<string, string>()
  props.data.branches?.forEach(b => { if (b.nodes) collectNodes(b.nodes, map) })
  return map
})

const resolvedLinks = computed(() => {
  return (props.data.links || []).map(link => ({
    ...link,
    fromText: nodeTextMap.value.get(link.fromId) || link.fromId,
    toText: nodeTextMap.value.get(link.toId) || link.toId,
  }))
})

function validNodes(nodes: any): TreeNode[] {
  if (!nodes || !Array.isArray(nodes)) return []
  return nodes.filter((n: any) => n && typeof n === 'object' && n.id)
}
</script>

<style scoped>
.custom-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: auto;
  padding-bottom: 16px;
}
.tree-root { margin-bottom: 0; }
.tree-stem {
  width: 2px;
  height: 24px;
  flex-shrink: 0;
}
.branch-level {
  display: flex;
  gap: 40px;
  position: relative;
}
/* Horizontal rail connecting branches */
.branch-level::before {
  content: '';
  position: absolute;
  top: 0;
  left: 25%;
  right: 25%;
  height: 2px;
  background: linear-gradient(to right, rgba(34,211,238,0.3), rgba(99,102,241,0.2), rgba(251,191,36,0.3));
}
.branch-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}
.branch-connector {
  width: 2px;
  height: 24px;
  flex-shrink: 0;
}
.subtree {
  margin-top: 4px;
}

/* Node cards */
.node-card {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: #e2e8f0;
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.2s;
}
.node-card:hover { background: rgba(255,255,255,0.08); transform: scale(1.02); }
.node-root {
  background: rgba(99,102,241,0.12);
  border-color: rgba(99,102,241,0.3);
  color: #c7d2fe;
  font-size: 15px;
  padding: 10px 20px;
}
.node-cyan {
  background: rgba(34,211,238,0.1);
  border-color: rgba(34,211,238,0.3);
  color: #67e8f9;
}
.node-amber {
  background: rgba(251,191,36,0.1);
  border-color: rgba(251,191,36,0.3);
  color: #fcd34d;
}

/* Line colors */
.line-cyan { background: rgba(34,211,238,0.35); }
.line-amber { background: rgba(251,191,36,0.35); }
</style>
