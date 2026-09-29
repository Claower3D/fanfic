import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Bold, 
  Italic, 
  Quote, 
  Eye, 
  Edit3, 
  Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Story, Rating, StoryStatus, ServerMember } from '../types';
import { ALL_TAGS } from '../data/initialData';
import { sound } from '../utils/soundEffects';

interface StoryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (story: Story) => void;
  members: ServerMember[];
  initialCharacter?: string;
}

export const StoryEditor: React.FC<StoryEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  initialCharacter,
}) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [author, setAuthor] = useState('くるми🖤🤍');
  const [authorRole, setAuthorRole] = useState('Архивариус SLX');
  const [rating, setRating] = useState<Rating>('PG-13');
  const [status, setStatus] = useState<StoryStatus>('В процессе');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [customCharInput, setCustomCharInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Лор SLX', 'Мэрия TERPYL']);
  const [customTagInput, setCustomTagInput] = useState('');
  
  // Chapter 1 content
  const [chapterTitle, setChapterTitle] = useState('Глава 1: Ночь в войсе');
  const [chapterContent, setChapterContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Initialize selected character when modal opens with initialCharacter
  useEffect(() => {
    if (isOpen) {
      if (initialCharacter) {
        setSelectedCharacters([initialCharacter]);
        const charMember = members.find(m => m.name === initialCharacter || m.displayName === initialCharacter);
        const nameToShow = charMember ? charMember.displayName : initialCharacter;
        setTitle(`Хроники: ${nameToShow}`);
      } else {
        setSelectedCharacters(['ÇĄƤÎTÃŇ DEMØĦİØGĄ', 'ŠŁÂÝĘŘ 🐺 WØLF']);
        setTitle('');
      }
      setChapterContent('');
      setSummary('');
    }
  }, [isOpen, initialCharacter, members]);

  if (!isOpen) return null;

  const toggleCharacter = (charName: string) => {
    setSelectedCharacters(prev => 
      prev.includes(charName) 
        ? prev.filter(c => c !== charName) 
        : [...prev, charName]
    );
  };

  const addCustomCharacter = () => {
    if (customCharInput.trim() && !selectedCharacters.includes(customCharInput.trim())) {
      setSelectedCharacters(prev => [...prev, customCharInput.trim()]);
      setCustomCharInput('');
    }
  };

  const toggleTag = (tag: string) => {
    if (tag === 'Все теги') return;
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim())) {
      setSelectedTags(prev => [...prev, customTagInput.trim()]);
      setCustomTagInput('');
    }
  };

  // Helper to insert markdown at cursor/end
  const insertText = (before: string, after: string = '') => {
    setChapterContent(prev => prev + before + after);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !chapterContent.trim()) {
      alert('Пожалуйста, заполните название и текст главы!');
      return;
    }

    sound.playJoin();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });

    const newStory: Story = {
      id: `story-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim() || 'Фанфик по мотивам серверных историй SLX.',
      author: author.trim() || 'Анонимный мембер',
      authorRole: authorRole.trim() || 'Участник SLX',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80',
      rating,
      status,
      characters: selectedCharacters,
      tags: selectedTags,
      pinned: false,
      likes: 1,
      views: 1,
      reactions: { '🔥': 1 },
      comments: [],
      coverGradient: 'from-violet-900 via-zinc-900 to-rose-950',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chapters: [
        {
          id: `ch-${Date.now()}`,
          title: chapterTitle.trim() || 'Глава 1',
          content: chapterContent.trim(),
          publishedAt: 'Только что',
          wordCount: chapterContent.trim().split(/\s+/).length,
        }
      ]
    };

    onSave(newStory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121422] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-purple-500/15 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#0d0e17] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">✍️</span>
            <div>
              <h2 className="text-base font-bold text-white">Написать фанфик для SLX</h2>
              <p className="text-xs text-zinc-400">Добавьте новую главу в летопись Discord сервера</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-zinc-300">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold tracking-wider text-zinc-400 mb-1">
                Название фанфика:
              </label>
              <input
                type="text"
                placeholder="например: Ночь в Мэрии TERPYL или Клатч века..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-sm font-semibold px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#3f4147] focus:outline-none focus:border-[#5865F2] text-white"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
                Краткое описание (Саммари):
              </label>
              <input
                type="text"
                placeholder="О чем история? Пару предложений для читателей..."
                value={summary}
                onChange={e => setSummary(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#3f4147] focus:outline-none focus:border-[#5865F2] text-white"
              />
            </div>
          </div>

          {/* Author & Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
                Автор:
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#1e1f22] border border-[#3f4147] focus:outline-none focus:border-[#5865F2] text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
                Роль автора:
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={e => setAuthorRole(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#1e1f22] border border-[#3f4147] focus:outline-none focus:border-[#5865F2] text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
                Рейтинг:
              </label>
              <select
                value={rating}
                onChange={e => setRating(e.target.value as Rating)}
                className="w-full px-2.5 py-1.5 rounded bg-[#1e1f22] border border-[#3f4147] focus:outline-none focus:border-[#5865F2] text-white"
              >
                <option value="G">G (Для всех)</option>
                <option value="PG-13">PG-13 (Умеренный кринж)</option>
                <option value="R-16">R-16 (Жаркие войс-баталии)</option>
                <option value="NC-17">NC-17 (Овердоз мем-безумия)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
                Статус:
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as StoryStatus)}
                className="w-full px-2.5 py-1.5 rounded bg-[#1e1f22] border border-[#3f4147] focus:outline-none focus:border-[#5865F2] text-white"
              >
                <option value="В процессе">В процессе</option>
                <option value="Завершен">Завершен</option>
                <option value="Заморожен">Заморожен</option>
              </select>
            </div>
          </div>

          {/* Characters Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] uppercase font-bold tracking-wider text-[#949ba4]">
                Персонажи сервера:
              </label>
              <span className="text-[10px] text-[#80848e]">Кликните, чтобы выбрать героев</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {members.map(m => {
                const isSelected = selectedCharacters.includes(m.name);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleCharacter(m.name)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-[#5865F2] border-[#5865F2] text-white font-bold'
                        : 'bg-[#1e1f22] border-[#3f4147] text-[#949ba4] hover:text-white'
                    }`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: m.roleColor }}
                    />
                    <span>{m.displayName}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Custom character input */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Добавить другого персонажа / бота..."
                value={customCharInput}
                onChange={e => setCustomCharInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomCharacter();
                  }
                }}
                className="flex-1 px-3 py-1 rounded bg-[#1e1f22] border border-[#3f4147] text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomCharacter}
                className="px-3 py-1 bg-[#35373c] hover:bg-[#3f4147] text-white rounded font-medium"
              >
                Добавить
              </button>
            </div>
          </div>

          {/* Tags Selection */}
          <div>
            <label className="block text-[11px] uppercase font-bold tracking-wider text-[#949ba4] mb-1.5">
              Теги истории:
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {ALL_TAGS.filter(t => t !== 'Все теги').map(tag => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold'
                      : 'bg-[#1e1f22] text-[#949ba4] border-[#313338] hover:text-white'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Свой тег..."
                value={customTagInput}
                onChange={e => setCustomTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                className="w-48 px-2 py-0.5 rounded bg-[#1e1f22] border border-[#3f4147] text-white focus:outline-none text-[11px]"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-2 py-0.5 bg-[#35373c] hover:bg-[#3f4147] text-white rounded text-[11px]"
              >
                + Тег
              </button>
            </div>
          </div>

          {/* Chapter Content Editor */}
          <div className="pt-2 border-t border-[#35373c]/50">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={chapterTitle}
                onChange={e => setChapterTitle(e.target.value)}
                placeholder="Название главы..."
                className="text-sm font-bold bg-transparent text-white focus:outline-none border-b border-transparent focus:border-[#5865F2] px-1 py-0.5"
              />

              <div className="flex items-center space-x-1">
                {/* Format buttons */}
                <button
                  type="button"
                  onClick={() => insertText('**жирный текст**')}
                  title="Жирный"
                  className="p-1 rounded bg-[#1e1f22] text-[#949ba4] hover:text-white"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText('*курсив*')}
                  title="Курсив"
                  className="p-1 rounded bg-[#1e1f22] text-[#949ba4] hover:text-white"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText('\n> Цитата из войса\n')}
                  title="Цитата"
                  className="p-1 rounded bg-[#1e1f22] text-[#949ba4] hover:text-white"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText('||спойлер||')}
                  title="Discord Спойлер"
                  className="px-1.5 py-0.5 rounded bg-[#1e1f22] text-[#949ba4] hover:text-white text-[10px] font-mono"
                >
                  ||...||
                </button>
                <button
                  type="button"
                  onClick={() => insertText('\n— ')}
                  title="Диалог"
                  className="px-2 py-0.5 rounded bg-[#1e1f22] text-[#949ba4] hover:text-white text-[11px] font-bold"
                >
                  —
                </button>

                <div className="w-px h-4 bg-[#3f4147] mx-1" />

                {/* Preview toggle */}
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold ${
                    previewMode ? 'bg-[#5865F2] text-white' : 'bg-[#1e1f22] text-[#949ba4]'
                  }`}
                >
                  {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{previewMode ? 'Редактор' : 'Предпросмотр'}</span>
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="w-full h-72 p-4 rounded-xl bg-[#1e1f22] border border-[#3f4147] overflow-y-auto space-y-3 font-serif-story leading-relaxed text-[#dbdee1]">
                <h3 className="text-lg font-bold text-white mb-2">{chapterTitle}</h3>
                {chapterContent ? (
                  chapterContent.split('\n\n').map((par, i) => (
                    <p key={i}>{par}</p>
                  ))
                ) : (
                  <p className="opacity-40 italic">Здесь будет предпросмотр вашего текста...</p>
                )}
              </div>
            ) : (
              <textarea
                value={chapterContent}
                onChange={e => setChapterContent(e.target.value)}
                placeholder="Напишите текст фанфика... Разделяйте абзацы двойным переводом строки Enter."
                rows={12}
                className="w-full p-4 rounded-xl bg-[#1e1f22] border border-[#3f4147] focus:outline-none focus:border-[#5865F2] text-[#dbdee1] leading-relaxed resize-none font-sans text-xs"
                required
              />
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#1f2023] flex items-center justify-between">
            <span className="text-[11px] text-[#80848e]">
              Слов: {chapterContent.trim() ? chapterContent.trim().split(/\s+/).length : 0}
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#35373c] hover:bg-[#3f4147] text-[#dbdee1] font-semibold transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold shadow-lg shadow-[#5865F2]/25 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Опубликовать в SLX</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
