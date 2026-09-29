import React from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Gamepad2, 
  PenTool, 
  Quote, 
  Trash2, 
  Shield
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
  const memberStories = stories.filter(s => 
    s.characters.includes(member.name) || 
    s.characters.includes(member.displayName) ||
    s.title.toLowerCase().includes(member.displayName.toLowerCase()) ||
    s.summary.toLowerCase().includes(member.displayName.toLowerCase())
  );

  const totalLikes = memberStories.reduce((acc, s) => acc + s.likes, 0);
  const totalViews = memberStories.reduce((acc, s) => acc + s.views, 0);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0c0d14] text-[#e2e8f0] flex flex-col bg-mesh">
      {/* Top Navigation */}
      <div className="sticky top-0 z-20 bg-[#0f111a]/80 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => {
            sound.playReaction();
            onBack();
          }}
          className="flex items-center space-x-2 text-xs font-bold text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-600 px-3.5 py-1.5 rounded-full transition-all cursor-pointer border border-purple-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к архиву</span>
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
              className="p-1.5 rounded-full text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              sound.playJoin();
              onWriteFicAboutMember(member.name);
            }}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Написать фанфик про {member.displayName}</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Profile Card Banner */}
        <div className="rounded-3xl bg-[#141624]/90 border border-white/10 overflow-hidden shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
          {/* Top colored cover */}
          <div 
            className="h-36 sm:h-44 w-full relative"
            style={{ 
              background: `linear-gradient(135deg, ${member.roleColor}99 0%, #181a28 65%, #0c0d14 100%)` 
            }}
          >
            <div className="absolute top-4 right-4 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
              <Shield className="w-3.5 h-3.5" style={{ color: member.roleColor }} />
              <span>{member.category}</span>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 sm:-mt-16 mb-5 gap-4">
              <div className="flex items-end space-x-4">
                {/* Monogram Badge */}
                <div 
                  className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center border-4 border-[#141624] shadow-2xl font-black text-2xl sm:text-3xl text-white shrink-0 shadow-purple-500/30"
                  style={{ backgroundColor: member.roleColor }}
                >
                  {member.displayName.slice(0, 1).toUpperCase()}
                </div>

                <div className="pb-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
                      {member.name}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className="text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider"
                      style={{
                        backgroundColor: `${member.roleColor}20`,
                        color: member.roleColor,
                        border: `1px solid ${member.roleColor}40`
                      }}
                    >
                      {member.role}
                    </span>
                    <span className="text-xs text-zinc-400">#{member.displayName}</span>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3 bg-[#0d0f17]/80 p-2.5 rounded-2xl border border-white/10 text-xs">
                <div className="text-center px-3">
                  <div className="font-extrabold text-white text-base">{memberStories.length}</div>
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Фанфиков</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center px-3">
                  <div className="font-extrabold text-rose-400 text-base">{totalLikes}</div>
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Лайков</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center px-3">
                  <div className="font-extrabold text-purple-400 text-base">{totalViews}</div>
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Просмотров</div>
                </div>
              </div>
            </div>

            {/* Status & Activity Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="bg-[#0f111c] p-3.5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Статус:
                </span>
                <span className="text-xs text-emerald-400 font-semibold italic">
                  «{member.statusText}»
                </span>
              </div>

              {member.gameStatus && (
                <div className="bg-[#0f111c] p-3.5 rounded-2xl border border-white/5 flex items-center space-x-2.5">
                  <Gamepad2 className="w-5 h-5 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Активность / Игра:
                    </span>
                    <span className="text-xs text-zinc-200 truncate block">
                      {member.gameStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            {member.bio && (
              <div className="bg-[#0f111c] p-4 rounded-2xl border border-white/5 mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  <span>О персонаже:</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            )}

            {/* Quotes section */}
            {member.quotes && member.quotes.length > 0 && (
              <div className="bg-[#0f111c] p-4 rounded-2xl border border-white/5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Quote className="w-3.5 h-3.5 text-amber-400" />
                  <span>Коронные цитаты:</span>
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
            <span className="text-xs bg-purple-500/15 text-purple-300 px-3 py-0.5 rounded-full font-semibold border border-purple-500/30">
              {memberStories.length}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playJoin();
              onWriteFicAboutMember(member.name);
            }}
            className="text-xs font-semibold text-purple-400 hover:text-white hover:underline flex items-center space-x-1"
          >
            <span>+ Добавить новый фанфик</span>
          </button>
        </div>

        {/* Stories Grid */}
        {memberStories.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#141624]/60 rounded-3xl border border-dashed border-white/10">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-base font-bold text-white mb-1">
              Про {member.displayName} ещё нет фанфиков!
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mb-5 leading-relaxed">
              Исправьте это и напишите первую историю про этого персонажа!
            </p>
            <button
              onClick={() => {
                sound.playJoin();
                onWriteFicAboutMember(member.name);
              }}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
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
