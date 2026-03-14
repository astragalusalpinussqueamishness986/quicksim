/**
 * API: Update or delete a user trait
 */
import { updateTrait, deleteTrait, addTrait, deleteDecision } from '../db/profile'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action, id, value, category, key } = body

  if (action === 'update') {
    if (!id || !value) {
      throw createError({ statusCode: 400, message: '缺少 id 或 value' })
    }
    updateTrait(id, value)
    return { ok: true, action: 'updated' }
  }

  if (action === 'delete') {
    if (!id) {
      throw createError({ statusCode: 400, message: '缺少 id' })
    }
    deleteTrait(id)
    return { ok: true, action: 'deleted' }
  }

  if (action === 'add') {
    if (!category || !key || !value) {
      throw createError({ statusCode: 400, message: '缺少 category, key 或 value' })
    }
    addTrait({ category, key, value })
    return { ok: true, action: 'added' }
  }

  if (action === 'delete_decision') {
    if (!id) {
      throw createError({ statusCode: 400, message: '缺少 id' })
    }
    deleteDecision(id)
    return { ok: true, action: 'decision_deleted' }
  }

  throw createError({ statusCode: 400, message: '无效 action' })
})
