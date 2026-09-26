import React from 'react';
import { X, BookOpen, Flame, Sparkles, Gamepad2, Shield } from 'lucide-react';
import { SERVER_MEMBERS } from '../data/initialData';
import { sound } from '../utils/soundEffects';

interface CharacterDirectoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (charName: string) => void;
  storyCounts: Record<string, number>;
}

export const CharacterDirectory: React.FC<CharacterDirectoryProps> = ({
  isOpen,
  onClose,
  onSelectCharacter,
  storyCounts,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#2b2d31] border border-[#1f2023] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2023] bg-[#232428] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#5865F2]/20 text-[#5865F2]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Досье Участников Сервера SLX</h2>
              <p className="text-xs text-[#949ba4]">Герои локального лора, войс-баталий и фанфиков</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#949ba4] hover:text-white hover:bg-[#35373c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Directory Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVER_MEMBERS.map(member => {
            const count = storyCounts[member.name] || 0;
            return (
              <div
                key={member.id}
                className="bg-[#1e1f22] border border-[#313338] hover:border-[#5865F2]/40 rounded-xl p-4 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Top user row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: member.roleColor }}
                      />
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-[#5865F2] transition-colors">
                          {member.name}
                        </div>
                        <span 
                          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-0.5"
                          style={{ 
                            backgroundColor: `${member.roleColor}25`, 
                            color: member.roleColor,
                            border: `1px solid ${member.roleColor}40`
                          }}
                        >
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs bg-[#2b2d31] px-2 py-0.5 rounded-full text-[#949ba4] border border-[#3f4147] shrink-0">
                      {count} фанф.
                    </span>
                  </div>

                  {/* Status / Game Activity */}
                  <div className="bg-[#2b2d31]/70 rounded-lg p-2.5 mb-3 text-xs border border-[#35373c]/50">
                    <div className="text-[11px] font-semibold text-[#dbdee1] flex items-center space-x-1 mb-1">
                      <span className="text-[#949ba4]">Статус:</span>
                      <span className="italic text-emerald-400">«{member.statusText}»</span>
                    </div>
                    {member.gameStatus && (
                      <div className="text-[11px] text-[#949ba4] flex items-center space-x-1">
                        <Gamepad2 className="w-3.5 h-3.5 text-[#5865F2] shrink-0" />
                        <span className="truncate">{member.gameStatus}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-[#b5bac1] leading-relaxed mb-4">
                    {member.bio}
                  </p>
                </div>

                {/* Filter action */}
                <button
                  onClick={() => {
                    sound.playReaction();
                    onSelectCharacter(member.name);
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[#35373c] hover:bg-[#5865F2] text-[#dbdee1] hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Показать все фанфики с {member.displayName}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
