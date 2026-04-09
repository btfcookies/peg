import cors from 'cors'
import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json')
const PORT = Number(process.env.PORT) || 3001

const USERNAME_PATTERN = /^[a-zA-Z0-9 _-]{3,20}$/

function clampNumber(value, fallback = 0) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  return Math.max(0, Math.round(parsed))
}

function sanitizeUsername(raw) {
  if (typeof raw !== 'string') {
    return null
  }
  const trimmed = raw.trim()
  if (!USERNAME_PATTERN.test(trimmed)) {
    return null
  }
  return trimmed
}

function normalizeUpgrades(raw) {
  if (!raw || typeof raw !== 'object') {
    return {}
  }

  const next = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof key !== 'string' || key.length > 64) {
      continue
    }
    next[key] = clampNumber(value, 0)
  }
  return next
}

function normalizeSlotLevels(raw) {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.slice(0, 20).map((entry) => clampNumber(entry, 1))
}

function normalizeOwnedSkins(raw) {
  if (!Array.isArray(raw)) {
    return []
  }
  return [...new Set(raw.filter((entry) => typeof entry === 'string').slice(0, 80))]
}

function normalizeEntry(raw) {
  const username = sanitizeUsername(raw?.username)
  if (!username) {
    return null
  }

  const now = new Date().toISOString()
  return {
    username,
    coins: clampNumber(raw?.coins, 0),
    totalCoins: clampNumber(raw?.totalCoins, 0),
    totalBalls: clampNumber(raw?.totalBalls, 1),
    upgrades: normalizeUpgrades(raw?.upgrades),
    slotLevels: normalizeSlotLevels(raw?.slotLevels),
    ownedSkins: normalizeOwnedSkins(raw?.ownedSkins),
    selectedSkin: typeof raw?.selectedSkin === 'string' ? raw.selectedSkin : 'default',
    updatedAt: typeof raw?.updatedAt === 'string' ? raw.updatedAt : now,
  }
}

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(LEADERBOARD_FILE)
  } catch {
    await fs.writeFile(LEADERBOARD_FILE, '[]', 'utf-8')
  }
}

async function readEntries() {
  await ensureStorage()
  try {
    const text = await fs.readFile(LEADERBOARD_FILE, 'utf-8')
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.map(normalizeEntry).filter(Boolean)
  } catch {
    return []
  }
}

async function writeEntries(entries) {
  await ensureStorage()
  const payload = JSON.stringify(entries, null, 2)
  await fs.writeFile(LEADERBOARD_FILE, payload, 'utf-8')
}

function sortByCoins(entries) {
  return [...entries].sort((a, b) => {
    if (b.coins !== a.coins) {
      return b.coins - a.coins
    }
    return a.username.localeCompare(b.username)
  })
}

const app = express()

app.use(cors())
app.use(express.json({ limit: '500kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/leaderboard', async (req, res) => {
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50))
  const entries = sortByCoins(await readEntries()).slice(0, limit)

  const withRank = entries.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }))

  res.json({
    entries: withRank,
    updatedAt: new Date().toISOString(),
  })
})

app.get('/api/leaderboard/:username', async (req, res) => {
  const username = sanitizeUsername(req.params.username)
  if (!username) {
    res.status(400).json({ error: 'Invalid username.' })
    return
  }

  const entries = sortByCoins(await readEntries())
  const index = entries.findIndex((entry) => entry.username.toLowerCase() === username.toLowerCase())
  if (index === -1) {
    res.status(404).json({ error: 'Player not found.' })
    return
  }

  res.json({
    rank: index + 1,
    player: entries[index],
  })
})

app.post('/api/leaderboard/submit', async (req, res) => {
  const username = sanitizeUsername(req.body?.username)
  if (!username) {
    res.status(400).json({ error: 'Username must be 3-20 characters using letters, numbers, spaces, _ or -.' })
    return
  }

  const nextEntry = normalizeEntry({
    ...req.body,
    username,
    updatedAt: new Date().toISOString(),
  })

  if (!nextEntry) {
    res.status(400).json({ error: 'Invalid payload.' })
    return
  }

  const entries = await readEntries()
  const existingIndex = entries.findIndex((entry) => entry.username.toLowerCase() === username.toLowerCase())

  if (existingIndex >= 0) {
    entries[existingIndex] = nextEntry
  } else {
    entries.push(nextEntry)
  }

  const sorted = sortByCoins(entries)
  await writeEntries(sorted)

  const rank = sorted.findIndex((entry) => entry.username.toLowerCase() === username.toLowerCase()) + 1

  res.json({
    ok: true,
    rank,
    player: nextEntry,
  })
})

app.listen(PORT, async () => {
  await ensureStorage()
  console.log(`Leaderboard server running at http://localhost:${PORT}`)
})
