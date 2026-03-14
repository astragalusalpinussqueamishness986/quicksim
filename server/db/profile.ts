/**
 * SQLite database for user profile persistence
 * Stores user traits, decision history, and extracted insights
 */
import Database from 'better-sqlite3'
import { resolve } from 'path'
import { mkdirSync } from 'fs'

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    const dbPath = resolve(process.cwd(), 'data', 'profile.db')
    mkdirSync(resolve(process.cwd(), 'data'), { recursive: true })

    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    initSchema(db)
  }
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    -- User traits: key-value pairs with confidence and source
    CREATE TABLE IF NOT EXISTS user_traits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,        -- 'basic', 'career', 'values', 'preferences', 'life'
      key TEXT NOT NULL,             -- e.g. 'age', 'city', 'risk_tolerance'
      value TEXT NOT NULL,           -- e.g. '25', '杭州', '低'
      confidence REAL DEFAULT 0.5,   -- 0-1, how sure we are
      source TEXT,                   -- which question/decision this was extracted from
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(category, key)          -- one value per category+key, latest wins
    );

    -- Decision history
    CREATE TABLE IF NOT EXISTS decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      choice_a TEXT,
      choice_b TEXT,
      brief TEXT,                    -- AI brief summary
      result_summary TEXT,           -- final insight
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Extracted traits per decision (many-to-many)
    CREATE TABLE IF NOT EXISTS decision_traits (
      decision_id INTEGER REFERENCES decisions(id),
      trait_category TEXT,
      trait_key TEXT,
      trait_value TEXT,
      PRIMARY KEY (decision_id, trait_category, trait_key)
    );
  `)
}

export function getAllTraits() {
  return getDb().prepare('SELECT * FROM user_traits ORDER BY category, key').all()
}

export function getTraitsByCategory(category: string) {
  return getDb().prepare('SELECT * FROM user_traits WHERE category = ?').all(category)
}

export function getProfileSummary(): string {
  const traits = getAllTraits() as any[]
  if (traits.length === 0) return ''

  const grouped: Record<string, string[]> = {}
  for (const t of traits) {
    if (!grouped[t.category]) grouped[t.category] = []
    grouped[t.category].push(`${t.key}: ${t.value}`)
  }

  const parts: string[] = ['[用户画像]']
  const categoryNames: Record<string, string> = {
    basic: '基本信息',
    career: '职业',
    values: '价值观',
    preferences: '偏好',
    life: '生活状况',
  }

  for (const [cat, items] of Object.entries(grouped)) {
    parts.push(`${categoryNames[cat] || cat}: ${items.join(', ')}`)
  }

  return parts.join('\n')
}

export function upsertTraits(traits: { category: string; key: string; value: string; confidence?: number; source?: string }[]) {
  const stmt = getDb().prepare(`
    INSERT INTO user_traits (category, key, value, confidence, source, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(category, key) DO UPDATE SET
      value = excluded.value,
      confidence = MAX(excluded.confidence, user_traits.confidence),
      source = excluded.source,
      updated_at = datetime('now')
  `)

  const tx = getDb().transaction(() => {
    for (const t of traits) {
      stmt.run(t.category, t.key, t.value, t.confidence || 0.5, t.source || '')
    }
  })
  tx()
}

export function addDecision(data: {
  question: string
  choiceA?: string
  choiceB?: string
  brief?: string
  resultSummary?: string
}) {
  const result = getDb().prepare(`
    INSERT INTO decisions (question, choice_a, choice_b, brief, result_summary)
    VALUES (?, ?, ?, ?, ?)
  `).run(data.question, data.choiceA || '', data.choiceB || '', data.brief || '', data.resultSummary || '')
  return result.lastInsertRowid
}

export function linkDecisionTraits(decisionId: number | bigint, traits: { category: string; key: string; value: string }[]) {
  const stmt = getDb().prepare(`
    INSERT OR IGNORE INTO decision_traits (decision_id, trait_category, trait_key, trait_value)
    VALUES (?, ?, ?, ?)
  `)
  const tx = getDb().transaction(() => {
    for (const t of traits) {
      stmt.run(decisionId, t.category, t.key, t.value)
    }
  })
  tx()
}

export function getGraphData() {
  const db = getDb()
  const traits = db.prepare('SELECT * FROM user_traits ORDER BY category, key').all() as any[]
  const decisions = db.prepare('SELECT * FROM decisions ORDER BY created_at DESC').all() as any[]
  const links = db.prepare('SELECT * FROM decision_traits').all() as any[]
  return { traits, decisions, links }
}

export function getRecentDecisions(limit = 10) {
  return getDb().prepare('SELECT * FROM decisions ORDER BY created_at DESC LIMIT ?').all(limit)
}

export function getDecisionCount() {
  return (getDb().prepare('SELECT COUNT(*) as count FROM decisions').get() as any).count
}
