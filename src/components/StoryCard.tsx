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
    'G': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'PG-13': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'R-16': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'NC-17': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playReaction();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#a855f7', '#ec4899', '#6366f1', '#10b981']
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
      className="group relative rounded-2xl bg-[#141624]/80 hover:bg-[#1a1d2e] border border-white/8 hover:border-purple-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Banner accent */}
      <div className={`h-2.5 bg-gradient-to-r ${story.coverGradient || 'from-violet-600 via-fuchsia-600 to-indigo-600'}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center flex-wrap gap-1.5">
            {story.pinned && (
              <span className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
                <Pin className="w-2.5 h-2.5" />
                <span>Закреп</span>
              </span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${ratingColors[story.rating] || ratingColors['G']}`}>
              {story.rating}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              story.status === 'Завершен' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-white/5 text-zinc-400 border border-white/10'
            }`}>
              {story.status}
            </span>
          </div>

          <div className="flex items-center text-[11px] text-zinc-400 space-x-1 bg-white/5 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-purple-400" />
            <span>~{readTimeMinutes} мин.</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2 leading-snug">
          {story.title}
        </h3>

        {/* Author info */}
        <div className="flex items-center space-x-1.5 mb-3">
          <span className="text-purple-400 font-mono text-xs">@</span>
          <span className="text-xs font-semibold text-zinc-300">{story.author}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
            {story.authorRole}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs text-zinc-400 line-clamp-3 mb-4 leading-relaxed flex-1">
          {story.summary}
        </p>

        {/* Characters involved */}
        {story.characters.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {story.characters.map((char) => (
                <span
                  key={char}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#1d2033] text-zinc-300 border border-white/5 font-medium flex items-center space-x-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>{char}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {story.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-zinc-500 hover:text-purple-300 bg-white/5 px-2 py-0.5 rounded-full transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer with stats and buttons */}
      <div className="px-5 py-3 bg-[#10121d] border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>{story.chapters.length} гл.</span>
          </span>
          <span className="flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            <span>{story.views}</span>
          </span>
          <span className="flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
            <span>{story.comments.length}</span>
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleShare}
            title="Поделиться в Discord"
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-purple-400 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleLike}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 hover:border-rose-500/40 transition-all font-semibold"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>{story.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
