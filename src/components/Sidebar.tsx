import React from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  Plus
} from 'lucide-react';
import { ServerMember } from '../types';
import { sound } from '../utils/soundEffects';

interface SidebarProps {
  selectedChannel: string;
  onSelectChannel: (channelId: string) => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  selectedCharacter: string;
  onSelectCharacter: (char: string) => void;
  storyCountsByChannel: Record<string, number>;
  members: ServerMember[];
  activeMemberId: string | null;
  onSelectMember: (member: ServerMember) => void;
  onOpenAddMemberModal: () => void;
  storyCountsByMember: Record<string, number>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedChannel,
  onSelectChannel,
  selectedTag,
  onSelectTag,
  selectedCharacter,
  onSelectCharacter,
  storyCountsByChannel,
  members,
  activeMemberId,
  onSelectMember,
  onOpenAddMemberModal,
  storyCountsByMember,
}) => {
  return (
    <aside className="w-64 bg-[#2b2d31] flex flex-col h-[calc(100vh-4rem)] border-r border-[#1f2023] shrink-0 select-none">
      {/* Server header banner */}
      <div className="h-12 border-b border-[#1f2023] px-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-[#35373c]/50 transition-colors">
        <div className="flex items-center space-x-2 font-bold text-white text-base">
          <span className="text-rose-500">🌹</span>
          <span className="tracking-wide">ṦŁẌ</span>
        </div>
        <ChevronDown className="w-4 h-4 text-[#949ba4]" />
      </div>

      {/* Main navigation area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* All Stories Button */}
        <div>
          <button
            onClick={() => {
              sound.playReaction();
              onSelectChannel('all');
              onSelectTag('Все теги');
              onSelectCharacter('');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-sm transition-all group ${
              selectedChannel === 'all' && !selectedCharacter && selectedTag === 'Все теги' && !activeMemberId
                ? 'bg-[#404249] text-white font-medium'
                : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              <BookOpen className="w-4 h-4 text-[#5865F2] shrink-0" />
              <span className="truncate font-semibold">Все фанфики архива</span>
            </div>
            <span className="text-xs bg-[#1e1f22] px-2 py-0.5 rounded text-[#dbdee1] font-mono">
              {storyCountsByChannel['all'] || 0}
            </span>
          </button>
        </div>

        {/* Characters section with NO avatars */}
        <div className="pt-2 border-t border-[#35373c]/50">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold tracking-wider text-[#949ba4] uppercase">
              Персонажи сервера
            </span>
            <button
              onClick={() => {
                sound.playPing();
                onOpenAddMemberModal();
              }}
              title="Добавить нового персонажа"
              className="p-1 rounded text-[#949ba4] hover:text-white hover:bg-[#35373c] transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          <div className="space-y-1">
            {members.map(member => {
              const isSelected = activeMemberId === member.id;
              const count = storyCountsByMember[member.name] || 0;
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    sound.playReaction();
                    onSelectMember(member);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-all group text-left ${
                    isSelected
                      ? 'bg-[#404249] text-white font-bold ring-1 ring-[#5865F2]'
                      : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                  }`}
                  title={`Открыть страничку: ${member.displayName}`}
                >
                  <div className="flex items-center space-x-2.5 truncate min-w-0">
                    {/* Clean role-colored indicator dot instead of image avatar */}
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: member.roleColor }}
                    />
                    <div className="truncate">
                      <div className="truncate font-semibold text-sm text-[#dbdee1] group-hover:text-white leading-tight">
                        {member.displayName}
                      </div>
                      <div 
                        className="text-[10px] font-bold truncate uppercase tracking-wider mt-0.5"
                        style={{ color: member.roleColor }}
                      >
                        {member.role}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1f22] text-[#949ba4] font-mono shrink-0 ml-1 border border-[#3f4147]">
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Add Member Button */}
            <button
              onClick={() => {
                sound.playJoin();
                onOpenAddMemberModal();
              }}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 mt-3 rounded-lg text-xs font-semibold text-[#5865F2] hover:bg-[#5865F2]/15 border border-dashed border-[#5865F2]/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить персонажа</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
