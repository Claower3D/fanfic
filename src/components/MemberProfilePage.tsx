import React from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Gamepad2, 
  PenTool, 
  Quote, 
  Flame, 
  Heart, 
  Eye, 
  Trash2, 
  Sparkles,
  Shield,
  MessageSquare
} from 'lucide-react';
import { ServerMember, Story } from '../types';
import { StoryCard } from './StoryCard';
import { sound } from '../utils/soundEffects';

interface MemberProfilePageProps {
  member: ServerMember;
  stories: Story[];
  onBack: () => void;
  onWriteFicAboutMember: (memberName: string) => void;
  onReadStory: (story: Story) => void;
  onLikeStory: (storyId: string) => void;
  onShareStory: (story: Story) => void;
  onDeleteMember?: (memberId: string) => void;
}

export const MemberProfilePage: React.FC<MemberProfilePageProps> = ({
  member,
  stories,
  onBack,
  onWriteFicAboutMember,
  onReadStory,
  onLikeStory,
  onShareStory,
  onDeleteMember,
}) => {
  // Filter stories about this member
  const memberStories = stories.filter(s => 
    s.characters.includes(member.name) || 
    s.characters.includes(member.displayName) ||
    s.title.toLowerCase().includes(member.displayName.toLowerCase()) ||
    s.summary.toLowerCase().includes(member.displayName.toLowerCase())
  );

  const totalLikes = memberStories.reduce((acc, s) => acc + s.likes, 0);
  const totalViews = memberStories.reduce((acc, s) => acc + s.views, 0);

  return (
    <div className="flex-1 overflow-y-auto bg-[#313338] text-[#dbdee1] flex flex-col">
      {/* Top Navigation */}
      <div className="sticky top-0 z-20 bg-[#2b2d31]/95 backdrop-blur-md border-b border-[#1f2023] px-6 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => {
            sound.playReaction();
            onBack();
          }}
          className="flex items-center space-x-2 text-xs font-bold text-[#5865F2] hover:text-white bg-[#5865F2]/10 hover:bg-[#5865F2] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад ко всем фанфикам</span>
        </button>

        <div className="flex items-center space-x-2">
          {member.isCustom && onDeleteMember && (
            <button
              onClick={() => {
                if (confirm(`Удалить персонажа ${member.displayName}?`)) {
                  onDeleteMember(member.id);
                  onBack();
                }
              }}
              title="Удалить этого созданного персонажа"
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              sound.playJoin();
              onWriteFicAboutMember(member.name);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-lg shadow-md shadow-[#5865F2]/20 transition-all cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Написать фанфик про {member.displayName}</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Discord Profile Card Banner */}
        <div className="bg-[#2b2d31] rounded-2xl border border-[#1f2023] overflow-hidden shadow-xl">
          {/* Top colored cover */}
          <div 
            className="h-32 sm:h-40 w-full relative"
            style={{ 
              background: `linear-gradient(135deg, ${member.roleColor}90 0%, #1e1f22 70%, #000000 100%)` 
            }}
          >
            <div className="absolute top-4 right-4 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
              <Shield className="w-3.5 h-3.5" style={{ color: member.roleColor }} />
              <span>{member.category}</span>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="px-6 pb-6 pt-0 relative">
            {/* Avatar overlapping banner */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
              <div className="flex items-end space-x-4">
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-4 border-[#2b2d31] shadow-2xl font-black text-2xl text-white shrink-0"
                  style={{ backgroundColor: member.roleColor }}
                >
                  {member.displayName.slice(0, 1).toUpperCase()}
                </div>

                <div className="pb-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white truncate">
                      {member.name}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider"
                      style={{
                        backgroundColor: `${member.roleColor}25`,
                        color: member.roleColor,
                        border: `1px solid ${member.roleColor}50`
                      }}
                    >
                      {member.role}
                    </span>
                    <span className="text-xs text-[#949ba4]">#{member.displayName}</span>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3 bg-[#1e1f22] p-2.5 rounded-xl border border-[#3f4147] text-xs">
                <div className="text-center px-2">
                  <div className="font-extrabold text-white text-base">{memberStories.length}</div>
                  <div className="text-[10px] text-[#949ba4] uppercase font-bold">Фанфиков</div>
                </div>
                <div className="w-px h-8 bg-[#3f4147]" />
                <div className="text-center px-2">
                  <div className="font-extrabold text-rose-400 text-base">{totalLikes}</div>
                  <div className="text-[10px] text-[#949ba4] uppercase font-bold">Лайков</div>
                </div>
                <div className="w-px h-8 bg-[#3f4147]" />
                <div className="text-center px-2">
                  <div className="font-extrabold text-[#5865F2] text-base">{totalViews}</div>
                  <div className="text-[10px] text-[#949ba4] uppercase font-bold">Просмотров</div>
                </div>
              </div>
            </div>

            {/* Status & Activity Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="bg-[#1e1f22] p-3 rounded-xl border border-[#3f4147]">
                <span className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider block mb-1">
                  Пользовательский статус:
                </span>
                <span className="text-xs text-emerald-400 font-semibold italic">
                  «{member.statusText}»
                </span>
              </div>

              {member.gameStatus && (
                <div className="bg-[#1e1f22] p-3 rounded-xl border border-[#3f4147] flex items-center space-x-2">
                  <Gamepad2 className="w-5 h-5 text-[#5865F2] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider block">
                      Текущая активность:
                    </span>
                    <span className="text-xs text-white truncate block">
                      {member.gameStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="bg-[#1e1f22] p-4 rounded-xl border border-[#3f4147] mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>О персонаже и серверном лоре:</span>
              </h3>
              <p className="text-xs text-[#b5bac1] leading-relaxed">
                {member.bio}
              </p>
            </div>

            {/* Quotes section */}
            {member.quotes && member.quotes.length > 0 && (
              <div className="bg-[#1e1f22] p-4 rounded-xl border border-[#3f4147]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Quote className="w-3.5 h-3.5 text-amber-400" />
                  <span>Коронные цитаты из войса:</span>
                </h3>
                <div className="space-y-1.5">
                  {member.quotes.map((q, idx) => (
                    <div key={idx} className="text-xs italic text-amber-300/90 pl-3 border-l-2 border-amber-400/50">
                      «{q}»
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stories Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">
              Фанфики с участием {member.displayName}
            </h2>
            <span className="text-xs bg-[#2b2d31] px-2.5 py-0.5 rounded-full text-[#949ba4] font-semibold border border-[#3f4147]">
              {memberStories.length}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playJoin();
              onWriteFicAboutMember(member.name);
            }}
            className="text-xs font-semibold text-[#5865F2] hover:text-white hover:underline flex items-center space-x-1"
          >
            <span>+ Добавить новый фанфик</span>
          </button>
        </div>

        {/* Stories Grid */}
        {memberStories.length === 0 ? (
          <div className="text-center py-14 px-4 bg-[#2b2d31]/50 rounded-2xl border border-dashed border-[#3f4147]">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-base font-bold text-white mb-1">
              Про {member.displayName} ещё нет фанфиков!
            </h3>
            <p className="text-xs text-[#949ba4] max-w-md mx-auto mb-4">
              Исправьте эту историческую несправедливость и напишите первую главу в историю этого участника сервера!
            </p>
            <button
              onClick={() => {
                sound.playJoin();
                onWriteFicAboutMember(member.name);
              }}
              className="px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-md shadow-[#5865F2]/20 transition-all cursor-pointer"
            >
              Написать первый фанфик про {member.displayName}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {memberStories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                onRead={onReadStory}
                onLike={onLikeStory}
                onShare={onShareStory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
