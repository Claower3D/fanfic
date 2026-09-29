import React from 'react';
import { 
  BookPlus, 
  Search, 
  Volume2, 
  VolumeX, 
  Users, 
  Sparkles,
  Radio,
  Plus
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  onOpenAddMemberModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  totalStories: number;
  totalMembers: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenAddMemberModal,
  soundEnabled,
  onToggleSound,
  totalStories,
  totalMembers,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0f111a]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 h-16 flex items-center justify-between transition-all">
      {/* Left: Server Brand */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5 cursor-pointer group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25 border border-white/20 text-lg group-hover:scale-105 transition-transform">
            🌹
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-base tracking-wider">ṦŁẌ</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 font-semibold border border-purple-500/30">
                Fanfics
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Сервер активен</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{totalStories} историй</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по архиву фанфиков..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#181a26]/90 text-xs text-white placeholder-zinc-500 rounded-full pl-9 pr-4 py-2 border border-white/10 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions in sleek pill style */}
      <div className="flex items-center space-x-2">
        {/* Sound toggle */}
        <button
          onClick={() => {
            onToggleSound();
            sound.playReaction();
          }}
          title={soundEnabled ? 'Звуковые эффекты включены' : 'Звук выключен'}
          className={`p-2 rounded-full border transition-all ${
            soundEnabled 
              ? 'bg-purple-500/15 text-purple-400 border-purple-500/30 hover:bg-purple-500/25 shadow-sm' 
              : 'bg-[#181a26] text-zinc-500 border-white/5 hover:text-white'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Add Member button */}
        <button
          onClick={() => {
            sound.playPing();
            onOpenAddMemberModal();
          }}
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white text-xs font-semibold border border-white/10 transition-all hover:border-white/20"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Персонаж</span>
        </button>

        {/* Write Fanfic button with gradient glow */}
        <button
          onClick={() => {
            sound.playJoin();
            onOpenCreateModal();
          }}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
        >
          <BookPlus className="w-3.5 h-3.5" />
          <span>Написать фанфик</span>
        </button>
      </div>
    </header>
  );
};
