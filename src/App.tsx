import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Download,
  BookOpen,
  Sparkles,
  UserPlus,
  Flame,
  Users,
  Search,
  CheckCircle2,
  Gamepad2,
  PenTool,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Story, Comment, ServerMember } from './types';
import { ALL_TAGS } from './data/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StoryCard } from './components/StoryCard';
import { StoryReader } from './components/StoryReader';
import { StoryEditor } from './components/StoryEditor';
import { CharacterDirectory } from './components/CharacterDirectory';
import { MemberProfilePage } from './components/MemberProfilePage';
import { AddMemberModal } from './components/AddMemberModal';
import { DiscordShareModal } from './components/DiscordShareModal';
import { sound } from './utils/soundEffects';
import { api } from './api';

export function App() {
  const [stories, setStories] = useState<Story[]>([]);
  const [members, setMembers] = useState<ServerMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab navigation inspired by user reference: 'feed' | 'members' | 'popular' | 'completed'
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'popular' | 'completed'>('feed');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('Все теги');
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [selectedRating, setSelectedRating] = useState('Все');
  const [sortBy, setSortBy] = useState<'newest' | 'likes' | 'views'>('newest');

  // Active Member Profile Page
  const [selectedMember, setSelectedMember] = useState<ServerMember | null>(null);

  // Modals & Navigation
  const [readingStory, setReadingStory] = useState<Story | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorInitialChar, setEditorInitialChar] = useState<string | undefined>(undefined);
  const [isCharactersOpen, setIsCharactersOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [sharingStory, setSharingStory] = useState<Story | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync sound engine enabled state
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Load from backend SQLite database
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [fetchedStories, fetchedMembers] = await Promise.all([
          api.getStories(),
          api.getMembers(),
        ]);
        if (mounted) {
          setStories(fetchedStories);
          setMembers(fetchedMembers);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  // Handle like story
  const handleLikeStory = async (storyId: string) => {
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        return { ...s, likes: s.likes + 1 };
      }
      return s;
    }));

    if (readingStory && readingStory.id === storyId) {
      setReadingStory(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }

    await api.likeStory(storyId);
  };

  // Handle react with emoji
  const handleReactStory = async (storyId: string, emoji: string) => {
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        const reactions = { ...(s.reactions || {}) };
        const userReactions = [...(s.userReactions || [])];
        
        if (userReactions.includes(emoji)) {
          reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
          const idx = userReactions.indexOf(emoji);
          userReactions.splice(idx, 1);
        } else {
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          userReactions.push(emoji);
        }

        return { ...s, reactions, userReactions };
      }
      return s;
    }));

    if (readingStory && readingStory.id === storyId) {
      setReadingStory(prev => {
        if (!prev) return null;
        const reactions = { ...(prev.reactions || {}) };
        const userReactions = [...(prev.userReactions || [])];
        if (userReactions.includes(emoji)) {
          reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
          userReactions.splice(userReactions.indexOf(emoji), 1);
        } else {
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          userReactions.push(emoji);
        }
        return { ...prev, reactions, userReactions };
      });
    }

    await api.reactStory(storyId, emoji);
  };

  // Handle add comment
  const handleAddComment = async (storyId: string, commentData: Omit<Comment, 'id' | 'timestamp' | 'likes'>) => {
    const created = await api.addComment(storyId, commentData);

    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        return { ...s, comments: [created, ...s.comments] };
      }
      return s;
    }));

    if (readingStory && readingStory.id === storyId) {
      setReadingStory(prev => prev ? { ...prev, comments: [created, ...prev.comments] } : null);
    }
  };

  // Save newly created story
  const handleSaveStory = async (newStory: Story) => {
    const created = await api.createStory(newStory);
    setStories(prev => [created, ...prev]);
  };

  // Add new member
  const handleAddMember = async (newMember: ServerMember) => {
    const created = await api.createMember(newMember);
    setMembers(prev => [...prev, created]);
    setSelectedMember(created);
  };

  // Delete member
  const handleDeleteMember = async (memberId: string) => {
    await api.deleteMember(memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
    if (selectedMember?.id === memberId) {
      setSelectedMember(null);
    }
  };

  // Open reader and increment view count
  const handleOpenReader = (story: Story) => {
    setReadingStory(story);
    setStories(prev => prev.map(s => {
      if (s.id === story.id) {
        return { ...s, views: s.views + 1 };
      }
      return s;
    }));
    api.viewStory(story.id);
  };

  // Open editor focused on a specific character
  const handleWriteFicAboutMember = (memberName: string) => {
    setEditorInitialChar(memberName);
    setIsEditorOpen(true);
  };

  // Counts by member
  const storyCountsByMember = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      counts[m.name] = stories.filter(s => 
        s.characters.includes(m.name) || 
        s.characters.includes(m.displayName) ||
        s.title.toLowerCase().includes(m.displayName.toLowerCase())
      ).length;
    });
    return counts;
  }, [stories, members]);

  // Filter and sort stories
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      // Tab filter
      if (activeTab === 'completed' && story.status !== 'Завершен') {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = story.title.toLowerCase().includes(q);
        const matchesSummary = story.summary.toLowerCase().includes(q);
        const matchesAuthor = story.author.toLowerCase().includes(q);
        const matchesChar = story.characters.some(c => c.toLowerCase().includes(q));
        const matchesTag = story.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesAuthor && !matchesChar && !matchesTag) {
          return false;
        }
      }

      // Tag filter
      if (selectedTag !== 'Все теги' && !story.tags.includes(selectedTag)) {
        return false;
      }

      // Character filter
      if (selectedCharacter && !story.characters.includes(selectedCharacter)) {
        return false;
      }

      // Rating filter
      if (selectedRating !== 'Все' && story.rating !== selectedRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (activeTab === 'popular' || sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'views') return b.views - a.views;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [stories, activeTab, searchQuery, selectedTag, selectedCharacter, selectedRating, sortBy]);

  // Filter members for members tab
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.displayName.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.statusText?.toLowerCase().includes(q) ||
      m.bio?.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  // Backup JSON
  const exportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ stories, members }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `slx_fanfics_backup_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="min-h-screen bg-[#0c0d14] text-[#e2e8f0] flex flex-col font-sans bg-mesh selection:bg-purple-500 selection:text-white">
      {/* Aesthetic Top Floating Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => {
          setEditorInitialChar(undefined);
          setIsEditorOpen(true);
        }}
        onOpenAddMemberModal={() => setIsAddMemberOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        totalStories={stories.length}
        totalMembers={members.length}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          selectedChannel="all"
          onSelectChannel={() => setSelectedMember(null)}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={char => {
            setSelectedCharacter(char);
            setSelectedMember(null);
            setActiveTab('feed');
          }}
          storyCountsByChannel={{ all: stories.length }}
          members={members}
          activeMemberId={selectedMember?.id || null}
          onSelectMember={member => {
            setSelectedMember(member);
          }}
          onOpenAddMemberModal={() => setIsAddMemberOpen(true)}
          storyCountsByMember={storyCountsByMember}
        />

        {/* Main Content Area */}
        {selectedMember ? (
          <MemberProfilePage
            member={selectedMember}
            stories={stories}
            onBack={() => setSelectedMember(null)}
            onWriteFicAboutMember={handleWriteFicAboutMember}
            onReadStory={handleOpenReader}
            onLikeStory={handleLikeStory}
            onShareStory={s => setSharingStory(s)}
            onDeleteMember={handleDeleteMember}
          />
        ) : (
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 flex flex-col">
            <div className="max-w-6xl w-full mx-auto space-y-7">
              {/* HERO BANNER (Directly inspired by user reference) */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 sm:p-10 shadow-2xl shadow-purple-500/20 border border-white/20">
                {/* Ambient glow orbs */}
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-950/60 blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-2xl">
                  {/* Top pill badge */}
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold tracking-wider uppercase mb-3 text-white shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>АРХИВ ЛОРА & ФАНФИКОВ SLX</span>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2.5">
                    Летописи & Фанфики Сообщества
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed mb-6 font-normal">
                    Читайте захватывающие истории о мемберах сервера, ночных войс-каналах и баталиях. Создавайте свои фанфики и сохраняйте серверный канон.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        sound.playJoin();
                        setEditorInitialChar(undefined);
                        setIsEditorOpen(true);
                      }}
                      className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-100 text-purple-950 font-bold text-xs shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center space-x-2"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Создать свой фанфик</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playPing();
                        setIsAddMemberOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center space-x-2 hover:scale-105 active:scale-95"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Добавить персонажа</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SEGMENTED NAVIGATION TABS (Like in user screenshot) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => {
                    sound.playReaction();
                    setActiveTab('feed');
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                    activeTab === 'feed'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-[#141624] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Лента фанфиков</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-white/90">
                    {stories.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    sound.playReaction();
                    setActiveTab('members');
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                    activeTab === 'members'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-[#141624] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Каталог персонажей</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-white/90">
                    {members.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    sound.playReaction();
                    setActiveTab('popular');
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                    activeTab === 'popular'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-[#141624] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Популярные истории</span>
                </button>

                <button
                  onClick={() => {
                    sound.playReaction();
                    setActiveTab('completed');
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                    activeTab === 'completed'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-[#141624] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Завершённые</span>
                </button>
              </div>

              {/* SEARCH & FILTERS BAR (Like in user screenshot) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#131522]/90 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-lg">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Поиск по названию, автору, персонажу, цитате..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-white placeholder-zinc-500 pl-10 pr-4 py-1.5 focus:outline-none"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter dropdowns */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Rating filter */}
                  <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(e.target.value)}
                    className="bg-[#1c1f30] text-zinc-300 text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Все">Параметры рейтинга</option>
                    <option value="G">G (Для всех)</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R-16">R-16</option>
                    <option value="NC-17">NC-17</option>
                  </select>

                  {/* Sort dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#1c1f30] text-zinc-300 text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="newest">Сначала новые</option>
                    <option value="likes">Топ по лайкам</option>
                    <option value="views">Топ по просмотрам</option>
                  </select>
                </div>
              </div>

              {/* Tag Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {ALL_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      sound.playReaction();
                      setSelectedTag(tag);
                    }}
                    className={`text-[11px] px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium border ${
                      selectedTag === tag
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                        : 'bg-[#141624] hover:bg-[#1a1d2e] text-zinc-400 hover:text-white border-white/5'
                    }`}
                  >
                    {tag === 'Все теги' ? tag : `#${tag}`}
                  </button>
                ))}
              </div>

              {/* ACTIVE FILTER BADGE */}
              {selectedCharacter && (
                <div className="flex items-center space-x-2 bg-purple-500/15 border border-purple-500/40 rounded-xl px-4 py-2 text-xs text-purple-300">
                  <span>Выбран персонаж: <strong className="text-white">{selectedCharacter}</strong></span>
                  <button 
                    onClick={() => setSelectedCharacter('')}
                    className="ml-auto underline hover:text-white text-xs"
                  >
                    Сбросить
                  </button>
                </div>
              )}

              {/* MAIN CONTENT: Tab 'feed', 'popular', 'completed' vs 'members' */}
              {loading ? (
                <div className="text-center py-24 text-zinc-400 text-xs">
                  Загрузка базы данных...
                </div>
              ) : activeTab === 'members' ? (
                /* MEMBERS CATALOG (Aesthetic Cards like in user reference) */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-white flex items-center space-x-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>Персонажи сервера ({filteredMembers.length})</span>
                    </h2>
                    <button
                      onClick={() => setIsAddMemberOpen(true)}
                      className="text-xs text-purple-400 hover:text-white font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Добавить нового</span>
                    </button>
                  </div>

                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-[#141624]/60 rounded-3xl border border-dashed border-white/10">
                      <div className="text-4xl mb-3">👤</div>
                      <h3 className="text-base font-bold text-white mb-1">
                        Персонажей пока нет
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-md mx-auto mb-5 leading-relaxed">
                        Добавьте первого персонажа сервера, чтобы привязать к нему фанфики и открыть личную анкету.
                      </p>
                      <button
                        onClick={() => setIsAddMemberOpen(true)}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
                      >
                        + Добавить персонажа
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredMembers.map(member => {
                        const count = storyCountsByMember[member.name] || 0;
                        return (
                          <div
                            key={member.id}
                            onClick={() => setSelectedMember(member)}
                            className="group relative rounded-3xl bg-[#141624]/90 hover:bg-[#1a1d2e] border border-white/8 hover:border-purple-500/40 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/15 hover:-translate-y-1 cursor-pointer overflow-hidden"
                          >
                            {/* Card Ambient top aura */}
                            <div 
                              className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
                              style={{ backgroundColor: member.roleColor }}
                            />

                            <div>
                              {/* Top category badge */}
                              <div className="flex items-center justify-between gap-2 mb-4">
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-semibold flex items-center space-x-1">
                                  <span>✨ {member.category}</span>
                                </span>
                                <span className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full font-mono border border-purple-500/25">
                                  {count} фанф.
                                </span>
                              </div>

                              {/* Member Identity */}
                              <div className="flex items-center space-x-3.5 mb-4">
                                <div 
                                  className="w-13 h-13 rounded-2xl flex items-center justify-center font-black text-xl text-white shrink-0 shadow-lg shadow-purple-500/20"
                                  style={{ backgroundColor: member.roleColor }}
                                >
                                  {member.displayName.slice(0, 1).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-bold text-white text-base truncate group-hover:text-purple-300 transition-colors">
                                    {member.name}
                                  </h3>
                                  <span 
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mt-0.5"
                                    style={{
                                      backgroundColor: `${member.roleColor}20`,
                                      color: member.roleColor,
                                      border: `1px solid ${member.roleColor}40`
                                    }}
                                  >
                                    {member.role}
                                  </span>
                                </div>
                              </div>

                              {/* Status & Activity */}
                              <div className="bg-[#0f111c] p-3 rounded-2xl border border-white/5 mb-4 space-y-1.5 text-xs">
                                <div className="text-emerald-400 font-medium italic text-[11px] truncate">
                                  «{member.statusText}»
                                </div>
                                {member.gameStatus && (
                                  <div className="text-zinc-400 text-[10px] flex items-center space-x-1.5 truncate">
                                    <Gamepad2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                    <span className="truncate">{member.gameStatus}</span>
                                  </div>
                                )}
                              </div>

                              {/* Bio */}
                              {member.bio && (
                                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                                  {member.bio}
                                </p>
                              )}
                            </div>

                            {/* Action Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playReaction();
                                setSelectedMember(member);
                              }}
                              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all border border-white/10 group-hover:border-transparent"
                            >
                              <span>Открыть анкету</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* STORIES GRID */
                <div>
                  {filteredStories.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-[#141624]/60 rounded-3xl border border-dashed border-white/10">
                      <div className="text-4xl mb-3">📝</div>
                      <h3 className="text-base font-bold text-white mb-1">
                        {stories.length === 0 ? 'Архив пока пуст' : 'По фильтрам ничего не найдено'}
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-md mx-auto mb-5 leading-relaxed">
                        {stories.length === 0 
                          ? 'В базе данных ещё нет записей. Создайте первых персонажей сервера и опубликуйте ваш первый фанфик!' 
                          : 'Попробуйте сбросить фильтры поиска или добавить новую главу.'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <button
                          onClick={() => setIsAddMemberOpen(true)}
                          className="px-5 py-2.5 rounded-full bg-[#1c1f30] hover:bg-[#25293d] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-white/10"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Создать персонажа</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditorInitialChar(undefined);
                            setIsEditorOpen(true);
                          }}
                          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center space-x-1.5 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Написать первый фанфик</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredStories.map(story => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          onRead={handleOpenReader}
                          onLike={handleLikeStory}
                          onShare={s => setSharingStory(s)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Aesthetic Footer */}
            <footer className="mt-auto pt-12 pb-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3 border-t border-white/5">
              <div className="flex items-center space-x-2">
                <span>🌹 <strong>ṦŁẌ Fanfics</strong> — Архив фанфиков Discord Сервера</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={exportBackup}
                  title="Скачать резервную копию базы данных (JSON)"
                  className="hover:text-purple-300 flex items-center space-x-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Бэкап JSON</span>
                </button>
              </div>
            </footer>
          </main>
        )}
      </div>

      {/* Reader Modal / Overlay */}
      {readingStory && (
        <StoryReader
          story={readingStory}
          onClose={() => setReadingStory(null)}
          onLike={handleLikeStory}
          onReact={handleReactStory}
          onAddComment={handleAddComment}
          onShare={s => setSharingStory(s)}
        />
      )}

      {/* Story Editor Modal */}
      <StoryEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditorInitialChar(undefined);
        }}
        onSave={handleSaveStory}
        members={members}
        initialCharacter={editorInitialChar}
      />

      {/* Characters Dossier Directory */}
      <CharacterDirectory
        isOpen={isCharactersOpen}
        onClose={() => setIsCharactersOpen(false)}
        onSelectCharacter={char => {
          const found = members.find(m => m.name === char || m.displayName === char);
          if (found) {
            setSelectedMember(found);
          } else {
            setSelectedCharacter(char);
          }
          setIsCharactersOpen(false);
        }}
        storyCounts={storyCountsByMember}
      />

      {/* Add New Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddMember}
      />

      {/* Discord Share Modal */}
      <DiscordShareModal
        story={sharingStory}
        isOpen={!!sharingStory}
        onClose={() => setSharingStory(null)}
      />
    </div>
  );
}

export default App;
