import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Settings2, 
  Volume2, 
  VolumeX, 
  Share2, 
  Download, 
  Play, 
  Pause, 
  Square, 
  Heart, 
  BookOpen, 
  Send, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  MessageSquare,
  Flame,
  Radio,
  Sliders,
  Type
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Story, Chapter, ReaderSettings, Comment } from '../types';
import { sound } from '../utils/soundEffects';

interface StoryReaderProps {
  story: Story;
  onClose: () => void;
  onLike: (storyId: string) => void;
  onReact: (storyId: string, emoji: string) => void;
  onAddComment: (storyId: string, comment: Omit<Comment, 'id' | 'timestamp' | 'likes'>) => void;
  onShare: (story: Story) => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  onClose,
  onLike,
  onReact,
  onAddComment,
  onShare,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Reader settings state
  const [settings, setSettings] = useState<ReaderSettings>({
    theme: 'discord',
    font: 'serif',
    fontSize: 18,
    lineHeight: 'normal',
    ambientSound: 'none',
    soundVolume: 0.3,
  });

  // TTS state
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // New comment state
  const [commentAuthor, setCommentAuthor] = useState('Гость из # шмары-slx');
  const [commentRole, setCommentRole] = useState('Гость SLX');
  const [commentText, setCommentText] = useState('');

  const currentChapter = story.chapters[currentChapterIndex] || story.chapters[0];

  // Stop ambient and TTS on unmount
  useEffect(() => {
    return () => {
      sound.stopAmbient();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle ambient sound change
  const handleAmbientChange = (type: 'none' | 'rain' | 'cs2' | 'discord') => {
    setSettings(prev => ({ ...prev, ambientSound: type }));
    sound.setAmbient(type, settings.soundVolume);
  };

  // Handle TTS
  const toggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Ваш браузер не поддерживает Text-To-Speech');
      return;
    }

    if (ttsPlaying) {
      window.speechSynthesis.cancel();
      setTtsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = `${currentChapter.title}. ${currentChapter.content.replace(/[#>*_~`]/g, '')}`;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.0;

    // Pick a Russian voice if available
    const voices = window.speechSynthesis.getVoices();
    const ruVoice = voices.find(v => v.lang.startsWith('ru'));
    if (ruVoice) {
      utterance.voice = ruVoice;
    }

    utterance.onend = () => setTtsPlaying(false);
    utterance.onerror = () => setTtsPlaying(false);

    ttsUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setTtsPlaying(true);
  };

  // Reactions
  const availableEmojis = ['🔥', '💀', '🤡', '💖', '🍷', '🗿', '🐺', '🎮'];

  const handleEmojiClick = (emoji: string, e: React.MouseEvent) => {
    sound.playReaction();
    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 20,
      spread: 45,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#5865F2', '#eb459f', '#57f287']
    });
    onReact(story.id, emoji);
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    sound.playPing();

    const roleColors: Record<string, string> = {
      'Мифический Далбаёб': '#e91e63',
      'Ч.М.О': '#2ecc71',
      'KVASSEXUAL': '#e67e22',
      'Собакаед и Шизоид': '#9b59b6',
      'Модератор SLX': '#5865F2',
      'Гость SLX': '#949ba4'
    };

    onAddComment(story.id, {
      author: commentAuthor,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      role: commentRole,
      roleColor: roleColors[commentRole] || '#949ba4',
      content: commentText.trim(),
    });

    setCommentText('');
  };

  const downloadStory = () => {
    sound.playReaction();
    let text = `# ${story.title}\nАвтор: ${story.author} (${story.authorRole})\nРейтинг: ${story.rating}\nПерсонажи: ${story.characters.join(', ')}\n\n`;
    story.chapters.forEach((ch, i) => {
      text += `## ${ch.title}\n\n${ch.content}\n\n---\n\n`;
    });

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Theme style mapping
  const themeClasses: Record<string, { bg: string; text: string; paper: string; border: string }> = {
    discord: {
      bg: 'bg-[#1e1f22]',
      text: 'text-[#dbdee1]',
      paper: 'bg-[#2b2d31]',
      border: 'border-[#1f2023]',
    },
    midnight: {
      bg: 'bg-[#090d16]',
      text: 'text-[#cbd5e1]',
      paper: 'bg-[#0f172a]',
      border: 'border-blue-950',
    },
    sepia: {
      bg: 'bg-[#ece4d0]',
      text: 'text-[#382b1c]',
      paper: 'bg-[#fbf5e6]',
      border: 'border-[#dfd3be]',
    },
    oled: {
      bg: 'bg-[#000000]',
      text: 'text-[#e4e4e7]',
      paper: 'bg-[#0a0a0a]',
      border: 'border-zinc-900',
    },
  };

  const fontClasses: Record<string, string> = {
    sans: "font-['Inter']",
    serif: "font-reading",
    mono: "font-['JetBrains_Mono']",
  };

  const lineHeightClasses: Record<string, string> = {
    tight: 'leading-relaxed',
    normal: 'leading-[1.8]',
    relaxed: 'leading-[2.2]',
  };

  const currentTheme = themeClasses[settings.theme] || themeClasses.discord;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${currentTheme.bg} ${currentTheme.text} transition-colors duration-200 flex flex-col`}>
      {/* Sticky Reader Navbar */}
      <div className={`sticky top-0 z-40 backdrop-blur-md ${currentTheme.paper}/90 border-b ${currentTheme.border} px-4 py-2.5 flex items-center justify-between shadow-sm`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              sound.playReaction();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] font-semibold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>К списку фанфиков</span>
          </button>
          
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold truncate max-w-md">{story.title}</h2>
            <div className="text-[11px] text-[#949ba4] flex items-center space-x-2">
              <span>{story.author}</span>
              <span>•</span>
              <span>Глава {currentChapterIndex + 1} из {story.chapters.length}</span>
            </div>
          </div>
        </div>

        {/* Reader actions */}
        <div className="flex items-center space-x-1.5">
          {/* TTS Player */}
          <button
            onClick={toggleTTS}
            title={ttsPlaying ? 'Остановить озвучку' : 'Слушать фанфик (Озвучка роботом)'}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
              ttsPlaying 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'hover:bg-white/5 border-transparent text-[#949ba4]'
            }`}
          >
            {ttsPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{ttsPlaying ? 'Пауза' : 'Озвучка'}</span>
          </button>

          {/* Download */}
          <button
            onClick={downloadStory}
            title="Скачать фанфик (.md)"
            className="p-1.5 rounded hover:bg-white/5 text-[#949ba4] hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Share */}
          <button
            onClick={() => {
              sound.playPing();
              onShare(story);
            }}
            title="Поделиться в Discord"
            className="p-1.5 rounded hover:bg-white/5 text-[#949ba4] hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Settings Toggle */}
          <button
            onClick={() => {
              sound.playReaction();
              setSettingsOpen(!settingsOpen);
            }}
            className={`p-1.5 rounded transition-colors ${
              settingsOpen 
                ? 'bg-[#5865F2] text-white' 
                : 'hover:bg-white/5 text-[#949ba4] hover:text-white'
            }`}
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reader Settings Floating Panel */}
      {settingsOpen && (
        <div className={`p-4 border-b ${currentTheme.border} ${currentTheme.paper} shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4 text-xs`}>
          {/* Themes */}
          <div>
            <div className="font-bold uppercase tracking-wider mb-2 opacity-70">Тема оформления</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'discord', label: 'Discord Тёмная', bg: '#2b2d31' },
                { id: 'midnight', label: 'Полночь', bg: '#0f172a' },
                { id: 'sepia', label: 'Сепия / Книга', bg: '#fbf5e6' },
                { id: 'oled', label: 'Amoled Black', bg: '#000000' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSettings(s => ({ ...s, theme: t.id as any }))}
                  className={`px-2 py-1.5 rounded border text-left flex items-center space-x-2 ${
                    settings.theme === t.id 
                      ? 'border-[#5865F2] ring-1 ring-[#5865F2] font-bold' 
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.bg }} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <div className="font-bold uppercase tracking-wider mb-2 opacity-70">Шрифт текста</div>
            <div className="flex gap-1.5 mb-2">
              {[
                { id: 'serif', label: 'Книжный (Serif)' },
                { id: 'sans', label: 'Современный' },
                { id: 'mono', label: 'Код/Моно' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSettings(s => ({ ...s, font: f.id as any }))}
                  className={`flex-1 py-1 px-2 rounded border text-center ${
                    settings.font === f.id ? 'border-[#5865F2] bg-[#5865F2]/20 font-bold' : 'border-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] mb-1">
              <span>Размер шрифта:</span>
              <span className="font-mono font-bold">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min="14"
              max="26"
              value={settings.fontSize}
              onChange={e => setSettings(s => ({ ...s, fontSize: Number(e.target.value) }))}
              className="w-full accent-[#5865F2]"
            />
          </div>

          {/* Line Height */}
          <div>
            <div className="font-bold uppercase tracking-wider mb-2 opacity-70">Интервал строк</div>
            <div className="flex gap-1.5">
              {[
                { id: 'tight', label: 'Компактный' },
                { id: 'normal', label: 'Стандартный' },
                { id: 'relaxed', label: 'Просторный' },
              ].map(lh => (
                <button
                  key={lh.id}
                  onClick={() => setSettings(s => ({ ...s, lineHeight: lh.id as any }))}
                  className={`flex-1 py-1 px-2 rounded border text-center ${
                    settings.lineHeight === lh.id ? 'border-[#5865F2] bg-[#5865F2]/20 font-bold' : 'border-white/10'
                  }`}
                >
                  {lh.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Ambiance */}
          <div>
            <div className="font-bold uppercase tracking-wider mb-2 opacity-70">Фоновый звук (Амбиенс)</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'none', label: 'Без звука' },
                { id: 'rain', label: '🌧️ Дождь' },
                { id: 'cs2', label: '🏜️ Ветер CS2' },
                { id: 'discord', label: '🎧 Lo-Fi Дискорд' },
              ].map(amb => (
                <button
                  key={amb.id}
                  onClick={() => handleAmbientChange(amb.id as any)}
                  className={`py-1 px-2 rounded border text-left ${
                    settings.ambientSound === amb.id ? 'border-[#5865F2] bg-[#5865F2]/20 font-bold' : 'border-white/10'
                  }`}
                >
                  {amb.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
        {/* Story Header Banner */}
        <div className="mb-8 pb-6 border-b border-white/10 text-center">
          <div className="flex justify-center items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/40">
              {story.rating}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10">
              {story.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight">
            {story.title}
          </h1>

          <div className="flex items-center justify-center space-x-2 text-xs opacity-80 mb-4">
            <span className="text-[#5865F2] font-mono">@</span>
            <span className="font-semibold">{story.author}</span>
            <span>•</span>
            <span className="opacity-70">{story.authorRole}</span>
          </div>

          {/* Summary Quote */}
          <div className="max-w-xl mx-auto p-4 rounded-xl bg-white/5 border border-white/10 text-xs italic opacity-90 leading-relaxed text-left">
            «{story.summary}»
          </div>

          {/* Characters list */}
          <div className="mt-4 flex flex-wrap justify-center items-center gap-1.5">
            <span className="text-xs opacity-60">В ролях:</span>
            {story.characters.map(char => (
              <span key={char} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-medium">
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Chapters tabs if multiple */}
        {story.chapters.length > 1 && (
          <div className="flex items-center justify-center space-x-2 mb-8 overflow-x-auto py-1">
            {story.chapters.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => {
                  sound.playReaction();
                  setCurrentChapterIndex(idx);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentChapterIndex === idx
                    ? 'bg-[#5865F2] text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                Глава {idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Current Chapter Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1">{currentChapter.title}</h2>
          <div className="text-xs opacity-60">
            Опубликовано: {currentChapter.publishedAt}
          </div>
        </div>

        {/* Chapter Content with Custom Styling */}
        <article 
          className={`space-y-5 ${fontClasses[settings.font]} ${lineHeightClasses[settings.lineHeight]}`}
          style={{ fontSize: `${settings.fontSize}px` }}
        >
          {currentChapter.content.split('\n\n').map((paragraph, pIdx) => {
            // Blockquote
            if (paragraph.startsWith('>')) {
              return (
                <blockquote 
                  key={pIdx} 
                  className="pl-4 py-1 border-l-4 border-[#5865F2] bg-[#5865F2]/10 rounded-r-md text-sm my-4 italic opacity-95"
                >
                  {paragraph.replace(/^>\s*/gm, '')}
                </blockquote>
              );
            }

            // Dialogue / Speech
            if (paragraph.startsWith('—')) {
              return (
                <p key={pIdx} className="pl-2">
                  <span className="font-semibold">{paragraph.slice(0, 1)}</span>
                  {paragraph.slice(1)}
                </p>
              );
            }

            return (
              <p key={pIdx} className="indent-4">
                {paragraph}
              </p>
            );
          })}
        </article>

        {/* Chapter Navigation Controls */}
        <div className="flex items-center justify-between my-12 pt-6 border-t border-white/10">
          <button
            disabled={currentChapterIndex === 0}
            onClick={() => {
              sound.playReaction();
              setCurrentChapterIndex(prev => Math.max(0, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Предыдущая глава</span>
          </button>

          <button
            disabled={currentChapterIndex >= story.chapters.length - 1}
            onClick={() => {
              sound.playReaction();
              setCurrentChapterIndex(prev => Math.min(story.chapters.length - 1, prev + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold shadow-md"
          >
            <span>Следующая глава</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Discord Emoji Reactions Section */}
        <div className={`p-6 rounded-2xl ${currentTheme.paper} border ${currentTheme.border} mb-8 shadow-md`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center space-x-2">
              <span>Реакции участников SLX:</span>
            </h3>
            <span className="text-xs opacity-60">Нажмите, чтобы проголосовать</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableEmojis.map(emoji => {
              const count = (story.reactions && story.reactions[emoji]) || 0;
              const hasReacted = story.userReactions?.includes(emoji);
              return (
                <button
                  key={emoji}
                  onClick={(e) => handleEmojiClick(emoji, e)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all transform active:scale-95 ${
                    hasReacted
                      ? 'bg-[#5865F2]/20 border-[#5865F2] text-white font-bold ring-1 ring-[#5865F2]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="text-xs font-mono">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Discord-style Comments Section */}
        <div className={`p-6 rounded-2xl ${currentTheme.paper} border ${currentTheme.border} shadow-md`}>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
            <h3 className="text-base font-bold flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#5865F2]" />
              <span>Обсуждение фанфика ({story.comments.length})</span>
            </h3>
            <span className="text-xs opacity-60">Канал лора SLX</span>
          </div>

          {/* Comments list */}
          <div className="space-y-4 mb-6">
            {story.comments.length === 0 ? (
              <div className="text-center py-6 opacity-60 text-xs">
                Пока никто не оставил отзыв. Будьте первым, кто напишет рецензию из войса!
              </div>
            ) : (
              story.comments.map(c => (
                <div key={c.id} className="flex items-start space-x-2.5 group">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                    style={{ backgroundColor: c.roleColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-xs" style={{ color: c.roleColor }}>
                        {c.author}
                      </span>
                      <span 
                        className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `${c.roleColor}20`, color: c.roleColor }}
                      >
                        {c.role}
                      </span>
                      <span className="text-[10px] opacity-40">{c.timestamp}</span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed break-words">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add comment form */}
          <form onSubmit={handleAddCommentSubmit} className="pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                  Ваш никнейм:
                </label>
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={e => setCommentAuthor(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded bg-black/20 border border-white/15 focus:outline-none focus:border-[#5865F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                  Ваша роль на сервере:
                </label>
                <select
                  value={commentRole}
                  onChange={e => setCommentRole(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded bg-black/40 border border-white/15 focus:outline-none focus:border-[#5865F2]"
                >
                  <option value="Мифический Далбаёб">Мифический Далбаёб</option>
                  <option value="Ч.М.О">Ч.М.О</option>
                  <option value="KVASSEXUAL">KVASSEXUAL</option>
                  <option value="Собакаед и Шизоид">Собакаед и Шизоид</option>
                  <option value="Модератор SLX">Модератор SLX</option>
                  <option value="Гость SLX">Гость SLX</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={2}
                placeholder="Написать комментарий в духе Discord... (Enter для отправки)"
                className="w-full text-xs p-3 rounded-lg bg-black/20 border border-white/15 focus:outline-none focus:border-[#5865F2] resize-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddCommentSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                className="absolute right-2 bottom-3 px-3 py-1 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Отправить</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
