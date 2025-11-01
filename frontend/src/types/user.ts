export interface ThemePreferences {
  primaryColor: string;
  mode: 'light' | 'dark';
  background: 'paper' | 'linen' | 'charcoal' | 'canvas' | 'grain' | 'stone' | 'ink' | 'velvet';
  fontFamily: string;
  widgets: {
    recentFocos: boolean;
    metasStatus: boolean;
    friends: boolean;
    timeline?: boolean;
    goalsChart?: boolean;
    achievements?: boolean;
    readingClock?: boolean;
    importQueue?: boolean;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  bio: string;
  theme: ThemePreferences;
  friends: string[];
  createdAt: string;
  updatedAt: string;
}
