import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppTheme } from '../types';

type ThemeState = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const currentTheme = get().theme;
        // Cycle through: system -> light -> dark -> system
        if (currentTheme === 'system') {
          set({ theme: 'light' });
        } else if (currentTheme === 'light') {
          set({ theme: 'dark' });
        } else {
          set({ theme: 'system' });
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
