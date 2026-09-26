import React from 'react';
import { 
  Heart, 
  Eye, 
  BookOpen, 
  MessageSquare, 
  Share2, 
  Pin,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Story } from '../types';
import { sound } from '../utils/soundEffects';

interface StoryCardProps {
  story: Story;
  onRead: (story: Story) => void;
  onLike: (storyId: string) => void;
  onShare: (story: Story) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onRead,
  onLike,
  onShare,
}) => {
  const ratingColors: Record<string, string> = {
    'G': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'PG-13': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'R-16': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'NC-17': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playReaction();
    
    // trigger confetti
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#5865F2', '#eb459f', '#57f287', '#fee75c']
    });

    onLike(story.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPing();
    onShare(story);
  };

  const totalWords = story.chapters.reduce((acc, ch) => acc + (ch.wordCount || 300), 0);
  const readTimeMinutes = Math.max(1, Math.round(totalWords / 180));

  return (
    <div 
      onClick={() => {
        sound.playJoin();
        onRead(story);
      }}
      className="group relative bg-[#2b2d31] hover:bg-[#313338] border border-[#1f2023] hover:border-[#5865F2]/50 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-[#5865F2]/10 flex flex-col justify-between"
    >
      {/* Top Banner accent */}
      <div className={`h-3 bg-gradient-to-r ${story.coverGradient || 'from-indigo-600 via-purple-600 to-pink-600'}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center flex-wrap gap-1.5">
            {story.pinned && (
              <span className="flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold">
                <Pin className="w-3 h-3" />
                <span>Закреплено</span>
              </span>
            )}
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${ratingColors[story.rating] || ratingColors['G']}`}>
              {story.rating}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              story.status === 'Завершен' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-zinc-700/40 text-zinc-300 border border-zinc-600/30'
            }`}>
              {story.status}
            </span>
          </div>

          <div className="flex items-center text-xs text-[#949ba4] space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>~{readTimeMinutes} мин.</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-[#5865F2] transition-colors line-clamp-2 mb-2 leading-snug">
          {story.title}
        </h3>

        {/* Author info */}
        <div className="flex items-center space-x-1.5 mb-3">
          <span className="text-[#5865F2] font-mono text-xs">@</span>
          <span className="text-xs font-semibold text-[#dbdee1]">{story.author}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e1f22] text-[#949ba4] border border-[#3f4147]">
            {story.authorRole}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs text-[#b5bac1] line-clamp-3 mb-4 leading-relaxed flex-1">
          {story.summary}
        </p>

        {/* Characters involved */}
        {story.characters.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-[#80848e] uppercase font-bold tracking-wider mb-1">
              Персонажи сервера:
            </div>
            <div className="flex flex-wrap gap-1">
              {story.characters.map((char) => (
                <span
                  key={char}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-[#1e1f22] text-zinc-300 border border-[#35373c] font-medium"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {story.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-[#949ba4] hover:text-white bg-[#232428] px-2 py-0.5 rounded transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Emoji Reactions Preview */}
        {story.reactions && Object.keys(story.reactions).length > 0 && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-[#35373c]/40 mb-3 overflow-x-auto pb-1">
            {Object.entries(story.reactions).map(([emoji, count]) => (
              <span
                key={emoji}
                className="text-xs px-2 py-0.5 rounded-full bg-[#1e1f22] border border-[#35373c] flex items-center space-x-1"
              >
                <span>{emoji}</span>
                <span className="text-[10px] font-bold text-[#b5bac1]">{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer with stats and buttons */}
      <div className="px-5 py-3 bg-[#232428] border-t border-[#1f2023] flex items-center justify-between text-xs text-[#949ba4]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5 text-[#5865F2]" />
            <span>{story.chapters.length} гл.</span>
          </span>
          <span className="flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{story.views}</span>
          </span>
          <span className="flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{story.comments.length}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            title="Скопировать ссылку для Discord (# шмары-slx)"
            className="p-1.5 rounded hover:bg-[#35373c] hover:text-[#5865F2] transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleLike}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#35373c] hover:bg-rose-500/20 text-rose-400 border border-[#3f4147] hover:border-rose-500/30 transition-all font-semibold"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>{story.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
