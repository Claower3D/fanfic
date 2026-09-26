import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Download,
  BookOpen,
  Sparkles,
  UserPlus
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
  // Start with empty data as requested by the user
  const [stories, setStories] = useState<Story[]>([]);
  const [members, setMembers] = useState<ServerMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Clear old mock cache if any existed
  useEffect(() => {
    try {
      localStorage.removeItem('slx_discord_fanfics_v1');
      localStorage.removeItem('slx_discord_members_v1');
    } catch {
      // Ignored
    }
  }, []);

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

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
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

  // Counts by channel
  const storyCountsByChannel = useMemo(() => {
    const counts: Record<string, number> = {
      all: stories.length,
    };
    return counts;
  }, [stories]);

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

      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'views') return b.views - a.views;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [stories, searchQuery, selectedTag, selectedCharacter, selectedRating, sortBy]);

  // Backup JSON
  const exportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ stories, members }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `slx_fanfics_backup_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] text-[#dbdee1] flex flex-col font-sans">
      {/* Top Discord Server Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => {
          setEditorInitialChar(undefined);
          setIsEditorOpen(true);
        }}
        onOpenCharactersModal={() => setIsCharactersOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        totalStories={stories.length}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar without clutter channels and without bottom user bar */}
        <Sidebar
          selectedChannel={selectedChannel}
          onSelectChannel={ch => {
            setSelectedChannel(ch);
            setSelectedMember(null);
          }}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={char => {
            setSelectedCharacter(char);
            setSelectedMember(null);
          }}
          storyCountsByChannel={storyCountsByChannel}
          members={members}
          activeMemberId={selectedMember?.id || null}
          onSelectMember={member => {
            setSelectedMember(member);
          }}
          onOpenAddMemberModal={() => setIsAddMemberOpen(true)}
          storyCountsByMember={storyCountsByMember}
        />

        {/* Main Content Area: either MemberProfilePage or General Stories List */}
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
          <main className="flex-1 overflow-y-auto bg-[#313338] flex flex-col">
            {/* Main Welcome Banner */}
            <div className="p-6 bg-gradient-to-r from-[#2b2d31] via-[#313338] to-[#26282c] border-b border-[#1f2023] shadow-sm">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl p-2 rounded-xl bg-[#1e1f22] border border-[#3f4147]">
                      🌹
                    </span>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
                        <span>Архив Фанфиков SLX</span>
                      </h1>
                      <p className="text-xs sm:text-sm text-[#949ba4] mt-0.5">
                        Летописи, истории и персонажи вашего Discord-сообщества
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAddMemberOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#35373c] hover:bg-[#3f4147] text-[#dbdee1] hover:text-white text-xs font-bold border border-[#3f4147] flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Добавить персонажа</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditorInitialChar(undefined);
                        setIsEditorOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-md shadow-[#5865F2]/20 flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Добавить фанфик</span>
                    </button>
                  </div>
                </div>

                {/* Tag filters row */}
                <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {ALL_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        sound.playReaction();
                        setSelectedTag(tag);
                      }}
                      className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium border ${
                        selectedTag === tag
                          ? 'bg-[#5865F2] text-white border-[#5865F2] shadow-sm'
                          : 'bg-[#2b2d31] hover:bg-[#35373c] text-[#949ba4] hover:text-white border-[#3f4147]'
                      }`}
                    >
                      {tag === 'Все теги' ? tag : `#${tag}`}
                    </button>
                  ))}
                </div>

                {/* Active Character Filter Indicator */}
                {selectedCharacter && (
                  <div className="mt-3 flex items-center space-x-2 bg-[#5865F2]/15 border border-[#5865F2]/40 rounded-lg px-3 py-1.5 text-xs text-[#5865F2]">
                    <span>Фильтр по персонажу: <strong className="text-white">{selectedCharacter}</strong></span>
                    <button 
                      onClick={() => setSelectedCharacter('')}
                      className="ml-auto underline hover:text-white"
                    >
                      Сбросить
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-bar: Sorting & Count */}
            <div className="px-6 py-3 border-b border-[#26282c] bg-[#2b2d31]/60 flex items-center justify-between text-xs text-[#949ba4]">
              <div className="flex items-center space-x-2">
                <span>Историй в базе данных: <strong className="text-white">{filteredStories.length}</strong></span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Rating filter */}
                <div className="flex items-center space-x-1">
                  <span>Рейтинг:</span>
                  <select
                    value={selectedRating}
                    onChange={e => setSelectedRating(e.target.value)}
                    className="bg-[#1e1f22] text-[#dbdee1] rounded px-2 py-1 text-xs border border-[#3f4147] focus:outline-none"
                  >
                    <option value="Все">Все</option>
                    <option value="G">G</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R-16">R-16</option>
                    <option value="NC-17">NC-17</option>
                  </select>
                </div>

                {/* Sort by */}
                <div className="flex items-center space-x-1">
                  <span>Сортировка:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="bg-[#1e1f22] text-[#dbdee1] rounded px-2 py-1 text-xs border border-[#3f4147] focus:outline-none"
                  >
                    <option value="newest">Свежие</option>
                    <option value="likes">Больше лайков</option>
                    <option value="views">Просмотры</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stories Grid / Clean Empty State */}
            <div className="flex-1 p-6 max-w-6xl w-full mx-auto">
              {loading ? (
                <div className="text-center py-20 text-[#949ba4] text-xs">
                  Загрузка базы данных...
                </div>
              ) : filteredStories.length === 0 ? (
                <div className="text-center py-16 px-4 bg-[#2b2d31]/40 rounded-2xl border border-dashed border-[#3f4147]">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {stories.length === 0 ? 'Архив пока пуст' : 'По фильтрам ничего не найдено'}
                  </h3>
                  <p className="text-xs text-[#949ba4] max-w-md mx-auto mb-5 leading-relaxed">
                    {stories.length === 0 
                      ? 'В базе данных ещё нет записей. Создайте первых персонажей сервера и опубликуйте ваш первый фанфик!' 
                      : 'Попробуйте сбросить фильтры поиска или добавить новую главу.'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setIsAddMemberOpen(true)}
                      className="px-4 py-2 rounded-lg bg-[#35373c] hover:bg-[#3f4147] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Создать персонажа</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditorInitialChar(undefined);
                        setIsEditorOpen(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-md shadow-[#5865F2]/20 flex items-center space-x-1.5 transition-all"
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

            {/* Footer */}
            <footer className="mt-auto px-6 py-4 bg-[#232428] border-t border-[#1f2023] flex flex-col sm:flex-row items-center justify-between text-xs text-[#949ba4] gap-2">
              <div className="flex items-center space-x-2">
                <span>🌹 <strong>ṦŁẌ Fanfics</strong> — Архив фанфиков Discord Сервера</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={exportBackup}
                  title="Скачать резервную копию базы данных (JSON)"
                  className="hover:text-white flex items-center space-x-1"
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
