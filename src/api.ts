import { Story, ServerMember, Comment } from './types';

const API_BASE = '/api';

export const api = {
  // --- MEMBERS ---
  async getMembers(): Promise<ServerMember[]> {
    try {
      const res = await fetch(`${API_BASE}/members`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    const saved = localStorage.getItem('slx_members_cache');
    return saved ? JSON.parse(saved) : [];
  },

  async createMember(member: ServerMember): Promise<ServerMember> {
    try {
      const res = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      if (res.ok) {
        const created = await res.json();
        return created;
      }
    } catch {
      // Offline fallback
    }
    return member;
  },

  async deleteMember(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/members/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // --- STORIES ---
  async getStories(): Promise<Story[]> {
    try {
      const res = await fetch(`${API_BASE}/stories`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    const saved = localStorage.getItem('slx_stories_cache');
    return saved ? JSON.parse(saved) : [];
  },

  async createStory(story: Story): Promise<Story> {
    try {
      const res = await fetch(`${API_BASE}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(story),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return story;
  },

  async deleteStory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/stories/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async likeStory(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/stories/${id}/like`, { method: 'POST' });
    } catch {
      // Ignored
    }
  },

  async viewStory(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/stories/${id}/view`, { method: 'POST' });
    } catch {
      // Ignored
    }
  },

  async reactStory(id: string, emoji: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/stories/${id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
    } catch {
      // Ignored
    }
  },

  async addComment(storyId: string, comment: Omit<Comment, 'id' | 'timestamp' | 'likes'>): Promise<Comment> {
    const id = `c-${Date.now()}`;
    const newComment: Comment = {
      ...comment,
      id,
      timestamp: 'Только что',
      likes: 0,
    };

    try {
      const res = await fetch(`${API_BASE}/stories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return newComment;
  },
};
