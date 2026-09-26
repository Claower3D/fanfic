import React, { useState } from 'react';
import { X, UserPlus, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ServerMember } from '../types';
import { sound } from '../utils/soundEffects';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: ServerMember) => void;
}

const PRESET_ROLE_COLORS = [
  { label: 'Зеленый ЧМО', color: '#2ecc71' },
  { label: 'Огненный Волк', color: '#e67e22' },
  { label: 'Розовый Мифик', color: '#e91e63' },
  { label: 'Фиолетовый Шизо', color: '#9b59b6' },
  { label: 'Синий Дрифт', color: '#3498db' },
  { label: 'Золотой VIP', color: '#f1c40f' },
  { label: 'Дискорд Blurple', color: '#5865F2' },
  { label: 'Красный Демон', color: '#e74c3c' },
];

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
}) => {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('Участник SLX');
  const [roleColor, setRoleColor] = useState('#5865F2');
  const [statusText, setStatusText] = useState('В сети');
  const [gameStatus, setGameStatus] = useState('Играет в Counter-Strike 2');
  const [bio, setBio] = useState('');
  const [quote, setQuote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Пожалуйста, укажите никнейм персонажа!');
      return;
    }

    sound.playJoin();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });

    const finalDisplayName = displayName.trim() || name.trim();

    const newMember: ServerMember = {
      id: `member-${Date.now()}`,
      name: name.trim(),
      displayName: finalDisplayName,
      role: role.trim() || 'Участник SLX',
      roleColor: roleColor || '#5865F2',
      avatar: '',
      statusText: statusText.trim() || 'В сети',
      gameStatus: gameStatus.trim() || undefined,
      category: `${role.trim()} — 1`,
      bio: bio.trim() || `Участник Discord сервера SLX. Про ${finalDisplayName} слагают легенды в войсе.`,
      ficsCount: 0,
      quotes: quote.trim() ? [quote.trim()] : undefined,
      isCustom: true,
      stats: {
        'Любимая игра': gameStatus.trim() || 'CS2',
        'Статус в войсе': 'Активен',
      }
    };

    onAddMember(newMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#2b2d31] border border-[#1f2023] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2023] bg-[#232428] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#5865F2]/20 text-[#5865F2]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Добавить Персонажа / Мембера SLX</h2>
              <p className="text-xs text-[#949ba4]">Создайте страничку участника для фанфиков</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#949ba4] hover:text-white hover:bg-[#35373c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-[#dbdee1]">
          {/* Preview Card */}
          <div className="bg-[#1e1f22] p-4 rounded-xl border border-[#3f4147] flex items-center space-x-3.5 mb-2">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white shrink-0 shadow-md"
              style={{ backgroundColor: roleColor }}
            >
              {(displayName || name || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm truncate">
                  {name || 'Никнейм персонажа'}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                  style={{
                    backgroundColor: `${roleColor}25`,
                    color: roleColor,
                    border: `1px solid ${roleColor}40`
                  }}
                >
                  {role || 'Роль'}
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 italic mt-0.5 truncate">
                «{statusText || 'Статус...'}»
              </div>
              {gameStatus && (
                <div className="text-[10px] text-[#949ba4] truncate mt-0.5">
                  🎮 {gameStatus}
                </div>
              )}
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
                Discord Никнейм:
              </label>
              <input
                type="text"
                placeholder="например: ÇĄƤÎTÃŇ DEMØĦİØGĄ"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#3f4147] text-white focus:outline-none focus:border-[#5865F2]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
                Отображаемое имя (для списка):
              </label>
              <input
                type="text"
                placeholder="например: Демонюга, Вольф..."
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#3f4147] text-white focus:outline-none focus:border-[#5865F2]"
              />
            </div>
          </div>

          {/* Role & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
                Роль на сервере:
              </label>
              <input
                type="text"
                placeholder="например: Ч.М.О, KVASSEXUAL, Мифический Далбаёб..."
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#3f4147] text-white focus:outline-none focus:border-[#5865F2]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
                Цвет роли:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={roleColor}
                  onChange={e => setRoleColor(e.target.value)}
                  className="w-8 h-8 rounded border border-[#3f4147] cursor-pointer bg-transparent"
                />
                <div className="flex-1 flex flex-wrap gap-1">
                  {PRESET_ROLE_COLORS.map(pr => (
                    <button
                      type="button"
                      key={pr.color}
                      onClick={() => setRoleColor(pr.color)}
                      className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110"
                      style={{ backgroundColor: pr.color }}
                      title={pr.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Status & Game Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
                Статус:
              </label>
              <input
                type="text"
                placeholder="например: Помолись на хардкоре"
                value={statusText}
                onChange={e => setStatusText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#3f4147] text-white focus:outline-none focus:border-[#5865F2]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
                Активность / Игра:
              </label>
              <input
                type="text"
                placeholder="например: Nuclear Nightmare / В войсе"
                value={gameStatus}
                onChange={e => setGameStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#3f4147] text-white focus:outline-none focus:border-[#5865F2]"
              />
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
              Биография / Описание персонажа:
            </label>
            <textarea
              placeholder="Расскажите о характере персонажа, его роли в войсе и фанфиках..."
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#3f4147] text-white focus:outline-none focus:border-[#5865F2] resize-none"
            />
          </div>

          {/* Quote */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#949ba4] mb-1">
              Коронная фраза из войса:
            </label>
            <input
              type="text"
              placeholder="например: «КТО КИНУЛ ГРЕНУ В СПИНУ?!»"
              value={quote}
              onChange={e => setQuote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#3f4147] text-white focus:outline-none focus:border-[#5865F2]"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-[#1f2023] flex items-center justify-end space-x-2">
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
              <span>Создать Персонажа</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
