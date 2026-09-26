import React from 'react';
import { 
  BookPlus, 
  Search, 
  Volume2, 
  VolumeX, 
  Users, 
  Sparkles,
  Flame,
  Radio
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  onOpenCharactersModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  totalStories: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenCharactersModal,
  soundEnabled,
  onToggleSound,
  totalStories,
}) => {
  return (
    <header className="h-16 bg-[#2b2d31] border-b border-[#1f2023] px-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left: Server Identity */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-900 via-rose-700 to-red-500 flex items-center justify-center shadow-lg border border-rose-500/30 text-xl font-bold">
            🌹
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-lg tracking-wider">ṦŁẌ</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#5865F2] font-semibold border border-[#5865F2]/40">
                Библиотека SLX
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#949ba4]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>В сети: 6 мемберов</span>
              <span className="text-[#4e5058]">•</span>
              <span className="flex items-center text-emerald-400">
                <Radio className="w-3 h-3 mr-1 animate-pulse" />
                Мэрия TERPYL (2:42:55)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#949ba4] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Искать фанфики, персонажей, фразы из войса..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#1e1f22] text-sm text-[#dbdee1] placeholder-[#80848e] rounded-md pl-9 pr-4 py-2 border border-[#3f4147] focus:outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#949ba4] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        {/* Sound toggle */}
        <button
          onClick={() => {
            onToggleSound();
            sound.playReaction();
          }}
          title={soundEnabled ? 'Звуковые эффекты Discord включены' : 'Звук выключен'}
          className={`p-2 rounded-lg transition-colors border ${
            soundEnabled 
              ? 'bg-[#35373c] text-emerald-400 border-emerald-500/30 hover:bg-[#3d3f45]' 
              : 'bg-[#1e1f22] text-[#80848e] border-[#313338] hover:text-[#dbdee1]'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Member Dossiers */}
        <button
          onClick={() => {
            sound.playPing();
            onOpenCharactersModal();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#35373c] hover:bg-[#3d3f45] text-[#dbdee1] hover:text-white text-xs font-medium rounded-md border border-[#3f4147] transition-all"
        >
          <Users className="w-3.5 h-3.5 text-[#5865F2]" />
          <span className="hidden sm:inline">Досье Участников</span>
        </button>

        {/* Write Fanfic */}
        <button
          onClick={() => {
            sound.playJoin();
            onOpenCreateModal();
          }}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold rounded-md shadow-md shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 transition-all cursor-pointer"
        >
          <BookPlus className="w-4 h-4" />
          <span>Написать Фанфик</span>
        </button>
      </div>
    </header>
  );
};
