import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { Story } from '../types';
import { sound } from '../utils/soundEffects';

interface DiscordShareModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DiscordShareModal: React.FC<DiscordShareModalProps> = ({
  story,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !story) return null;

  const discordMarkdown = `>>> 🌹 **[Архив Фанфиков SLX]** **${story.title}**
✍️ **Автор:** ${story.author} (${story.authorRole}) | 🏷️ **Рейтинг:** \`${story.rating}\`
👥 **В ролях:** ${story.characters.join(', ')}

> ${story.summary}

📖 *Читать в архиве фанфиков: #шмары-slx*`;

  const copyToClipboard = () => {
    sound.playReaction();
    navigator.clipboard.writeText(discordMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#2b2d31] border border-[#1f2023] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2023] bg-[#232428] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-[#5865F2]" />
            <h3 className="text-base font-bold text-white">Поделиться в Discord (# шмары-slx)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#949ba4] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-[#949ba4]">
            Скопируйте этот текст и отправьте в канал вашего Discord-сервера. Он красиво отформатирован со спойлерами и цитатами:
          </p>

          {/* Discord Message Preview Box */}
          <div className="bg-[#313338] border-l-4 border-[#5865F2] rounded-r-lg p-4 text-xs font-sans space-y-2 text-[#dbdee1]">
            <div className="flex items-center space-x-2">
              <span className="text-base">🌹</span>
              <span className="font-bold text-white">Архив Фанфиков SLX</span>
            </div>
            <div className="font-extrabold text-sm text-white">{story.title}</div>
            <div className="text-[11px] text-[#949ba4]">
              Автор: <span className="text-white font-medium">{story.author}</span> | Рейтинг: <span className="bg-[#1e1f22] px-1 py-0.5 rounded text-amber-400 font-mono">{story.rating}</span>
            </div>
            <div className="bg-[#2b2d31] p-2.5 rounded text-[11px] text-[#b5bac1] italic border border-[#3f4147]">
              {story.summary}
            </div>
            <div className="text-[10px] text-[#80848e]">
              Персонажи: {story.characters.join(', ')}
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-lg shadow-[#5865F2]/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Скопировано в буфер обмена!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Скопировать Markdown для Discord</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
