export interface BaseEntity {
  _id?: string;
  id?: string;
}

export interface Video extends BaseEntity {
  title: string;
  youtubeUrl?: string;
  videoId: string;
  thumbnailUrl: string;
  duration?: string;
  category: 'Sport' | 'Podcast' | 'TV Show' | 'Other' | string;
  uploadDate: string;
  views?: number;
}

export interface Match extends BaseEntity {
  team1: string;
  team2: string;
  team1Logo?: string;
  team2Logo?: string;
  date: string;
  time: string;
  status: 'live' | 'upcoming' | 'completed';
  venue?: string;
  imageUrl?: string;
  score1?: number;
  score2?: number;
}

export interface League extends BaseEntity {
  name: string;
  logoUrl?: string;
  matchCount: number;
  season: string;
}

export interface Highlight extends BaseEntity {
  title: string;
  thumbnailUrl: string;
  duration?: string;
  uploadDate: string;
  videoId: string;
  category: string;
  sport: string;
  featured: boolean;
  views: number;
}
