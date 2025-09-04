export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AppState {
  isLoading: boolean;
  user: User | null;
  language: 'en' | 'ar';
}