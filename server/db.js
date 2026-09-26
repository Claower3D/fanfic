import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dbDir = process.env.DATA_DIR || path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'fanfics.sqlite');
console.log(`[Database] Initializing SQLite at: ${dbPath}`);

export const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize schema (starts empty, no mock data)
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    displayName TEXT NOT NULL,
    role TEXT NOT NULL,
    roleColor TEXT NOT NULL,
    statusText TEXT,
    gameStatus TEXT,
    category TEXT,
    bio TEXT,
    quotes TEXT,
    stats TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    author TEXT NOT NULL,
    authorRole TEXT,
    authorAvatar TEXT,
    rating TEXT NOT NULL,
    status TEXT NOT NULL,
    characters TEXT,
    tags TEXT,
    chapters TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    reactions TEXT,
    coverGradient TEXT,
    pinned INTEGER DEFAULT 0,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    storyId TEXT NOT NULL,
    author TEXT NOT NULL,
    role TEXT NOT NULL,
    roleColor TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    createdAt TEXT,
    FOREIGN KEY(storyId) REFERENCES stories(id) ON DELETE CASCADE
  );
`);
