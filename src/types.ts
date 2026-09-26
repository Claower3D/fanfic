export type Rating = 'G' | 'PG-13' | 'R-16' | 'NC-17';

export type StoryStatus = 'В процессе' | 'Завершен' | 'Заморожен';

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  role: string;
  roleColor: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount?: number;
  publishedAt: string;
}

export interface Story {
  id: string;
  title: string;
  summary: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  rating: Rating;
  status: StoryStatus;
  characters: string[];
  tags: string[];
  chapters: Chapter[];
  likes: number;
  views: number;
  reactions: Record<string, number>;
  userReactions?: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  coverGradient?: string;
}

export interface ServerMember {
  id: string;
  name: string;
  displayName: string;
  role: string;
  roleColor: string;
  avatar: string;
  statusText: string;
  gameStatus?: string;
  category: string;
  bio: string;
  ficsCount?: number;
  quotes?: string[];
  stats?: Record<string, string>;
  isCustom?: boolean;
}

export type ReaderTheme = 'discord' | 'midnight' | 'sepia' | 'oled';
export type ReaderFont = 'sans' | 'serif' | 'mono';
export type LineHeight = 'tight' | 'normal' | 'relaxed';

export interface ReaderSettings {
  theme: ReaderTheme;
  font: ReaderFont;
  fontSize: number; // in px, e.g. 18
  lineHeight: LineHeight;
  ambientSound: 'none' | 'rain' | 'cs2' | 'discord';
  soundVolume: number;
}
