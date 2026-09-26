import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- API: MEMBERS ---

// GET /api/members - list all members
app.get('/api/members', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM members ORDER BY rowid ASC').all();
    const members = rows.map(r => ({
      ...r,
      quotes: r.quotes ? JSON.parse(r.quotes) : [],
      stats: r.stats ? JSON.parse(r.stats) : {},
      isCustom: true,
    }));
    res.json(members);
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// POST /api/members - create new member
app.post('/api/members', (req, res) => {
  try {
    const {
      id = `member-${Date.now()}`,
      name,
      displayName,
      role = 'Участник SLX',
      roleColor = '#5865F2',
      statusText = 'В сети',
      gameStatus = '',
      category = '',
      bio = '',
      quotes = [],
      stats = {},
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const createdAt = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO members (id, name, displayName, role, roleColor, statusText, gameStatus, category, bio, quotes, stats, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name.trim(),
      (displayName || name).trim(),
      role.trim(),
      roleColor,
      statusText.trim(),
      gameStatus.trim(),
      category.trim() || `${role.trim()} — 1`,
      bio.trim(),
      JSON.stringify(quotes),
      JSON.stringify(stats),
      createdAt
    );

    res.status(201).json({
      id,
      name: name.trim(),
      displayName: (displayName || name).trim(),
      role: role.trim(),
      roleColor,
      statusText: statusText.trim(),
      gameStatus: gameStatus.trim(),
      category: category.trim() || `${role.trim()} — 1`,
      bio: bio.trim(),
      quotes,
      stats,
      isCustom: true,
      createdAt,
    });
  } catch (err) {
    console.error('Error creating member:', err);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// DELETE /api/members/:id
app.delete('/api/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM members WHERE id = ?').run(id);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting member:', err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// --- API: STORIES ---

// GET /api/stories - list all stories with their comments
app.get('/api/stories', (req, res) => {
  try {
    const storyRows = db.prepare('SELECT * FROM stories ORDER BY pinned DESC, rowid DESC').all();
    const commentRows = db.prepare('SELECT * FROM comments ORDER BY rowid DESC').all();

    // Group comments by storyId
    const commentsByStory = {};
    for (const c of commentRows) {
      if (!commentsByStory[c.storyId]) {
        commentsByStory[c.storyId] = [];
      }
      commentsByStory[c.storyId].push(c);
    }

    const stories = storyRows.map(s => ({
      ...s,
      pinned: Boolean(s.pinned),
      characters: s.characters ? JSON.parse(s.characters) : [],
      tags: s.tags ? JSON.parse(s.tags) : [],
      chapters: s.chapters ? JSON.parse(s.chapters) : [],
      reactions: s.reactions ? JSON.parse(s.reactions) : {},
      comments: commentsByStory[s.id] || [],
    }));

    res.json(stories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// POST /api/stories - create new story
app.post('/api/stories', (req, res) => {
  try {
    const {
      id = `story-${Date.now()}`,
      title,
      summary = '',
      author = 'Аноним',
      authorRole = 'Участник SLX',
      authorAvatar = '',
      rating = 'PG-13',
      status = 'В процессе',
      characters = [],
      tags = [],
      chapters = [],
      coverGradient = 'from-violet-900 via-zinc-900 to-rose-950',
      pinned = false,
    } = req.body;

    if (!title || chapters.length === 0) {
      return res.status(400).json({ error: 'Title and at least one chapter are required' });
    }

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO stories (id, title, summary, author, authorRole, authorAvatar, rating, status, characters, tags, chapters, likes, views, reactions, coverGradient, pinned, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      title.trim(),
      summary.trim(),
      author.trim(),
      authorRole.trim(),
      authorAvatar || '',
      rating,
      status,
      JSON.stringify(characters),
      JSON.stringify(tags),
      JSON.stringify(chapters),
      1, // initial like
      1, // initial view
      JSON.stringify({ '🔥': 1 }),
      coverGradient,
      pinned ? 1 : 0,
      now,
      now
    );

    res.status(201).json({
      id,
      title: title.trim(),
      summary: summary.trim(),
      author: author.trim(),
      authorRole: authorRole.trim(),
      rating,
      status,
      characters,
      tags,
      chapters,
      likes: 1,
      views: 1,
      reactions: { '🔥': 1 },
      comments: [],
      coverGradient,
      pinned,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    console.error('Error creating story:', err);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// DELETE /api/stories/:id
app.delete('/api/stories/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM comments WHERE storyId = ?').run(id);
    db.prepare('DELETE FROM stories WHERE id = ?').run(id);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting story:', err);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

// POST /api/stories/:id/like
app.post('/api/stories/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE stories SET likes = likes + 1 WHERE id = ?').run(id);
    const updated = db.prepare('SELECT likes FROM stories WHERE id = ?').get(id);
    res.json({ success: true, likes: updated?.likes || 0 });
  } catch (err) {
    console.error('Error liking story:', err);
    res.status(500).json({ error: 'Failed to like story' });
  }
});

// POST /api/stories/:id/view
app.post('/api/stories/:id/view', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE stories SET views = views + 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error incrementing views:', err);
    res.status(500).json({ error: 'Failed to increment views' });
  }
});

// POST /api/stories/:id/react
app.post('/api/stories/:id/react', (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: 'Emoji is required' });

    const row = db.prepare('SELECT reactions FROM stories WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Story not found' });

    const reactions = row.reactions ? JSON.parse(row.reactions) : {};
    reactions[emoji] = (reactions[emoji] || 0) + 1;

    db.prepare('UPDATE stories SET reactions = ? WHERE id = ?').run(JSON.stringify(reactions), id);
    res.json({ success: true, reactions });
  } catch (err) {
    console.error('Error reacting to story:', err);
    res.status(500).json({ error: 'Failed to react to story' });
  }
});

// POST /api/stories/:id/comments
app.post('/api/stories/:id/comments', (req, res) => {
  try {
    const { id: storyId } = req.params;
    const {
      id = `c-${Date.now()}`,
      author,
      role = 'Гость SLX',
      roleColor = '#949ba4',
      content,
    } = req.body;

    if (!author || !content) {
      return res.status(400).json({ error: 'Author and content are required' });
    }

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO comments (id, storyId, author, role, roleColor, content, timestamp, likes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      storyId,
      author.trim(),
      role.trim(),
      roleColor,
      content.trim(),
      'Только что',
      0,
      now
    );

    res.status(201).json({
      id,
      storyId,
      author: author.trim(),
      role: role.trim(),
      roleColor,
      content: content.trim(),
      timestamp: 'Только что',
      likes: 0,
      createdAt: now,
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// --- SERVE STATIC FRONTEND IN PRODUCTION (RAILWAY / DOCKER) ---
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  console.log(`[Server] Serving production frontend from: ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback for all non-API GET requests
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] SLX Fanfics Backend listening on port ${PORT}`);
});
