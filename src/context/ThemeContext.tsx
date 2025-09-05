import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, LAYOUT, ANIMATION, TASK_COLORS } from '../constants';

type ThemeMode = 'light' | 'dark' | 'auto';

interface Theme {
  colors: typeof COLORS;
  typography: typeof TYPOGRAPHY;
  spacing: typeof SPACING;
  layout: typeof LAYOUT;
  animation: typeof ANIMATION;
  taskColors: typeof TASK_COLORS;
  isDark: boolean;
  mode: ThemeMode;
}

interface ThemeContextValue {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// Dark theme colors (for future implementation)
const DARK_COLORS = {
  ...COLORS,
  // Background System
  background: {
    primary: '#0F172A',      // slate-900
    secondary: '#1E293B',    // slate-800
    gradient: ['#0F172A', '#1E293B'],
  },
  
  // Surface Colors
  surface: {
    primary: '#1E293B',      // slate-800
    elevated: '#334155',     // slate-700
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  // Text Colors
  text: {
    primary: '#F1F5F9',      // slate-100
    secondary: '#CBD5E1',    // slate-300
    tertiary: '#94A3B8',     // slate-400
    inverse: '#1F2937',      // dark text on light backgrounds
    disabled: '#64748B',     // slate-500
  },
  
  // Border Colors
  border: {
    light: '#374151',        // gray-700
    medium: '#4B5563',       // gray-600
    dark: '#6B7280',         // gray-500
  },
};

const createTheme = (isDark: boolean, mode: ThemeMode): Theme => ({
  colors: isDark ? DARK_COLORS : COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  layout: LAYOUT,
  animation: ANIMATION,
  taskColors: TASK_COLORS,
  isDark,
  mode,
});

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'auto' }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode);
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Listen to system appearance changes
  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => listener?.remove();
  }, []);

  // Determine if dark mode should be active
  const isDarkMode = 
    themeMode === 'dark' || 
    (themeMode === 'auto' && systemColorScheme === 'dark');

  const theme = createTheme(isDarkMode, themeMode);

  const toggleTheme = () => {
    setThemeMode(current => {
      switch (current) {
        case 'light': return 'dark';
        case 'dark': return 'auto';
        case 'auto': return 'light';
        default: return 'light';
      }
    });
  };

  const contextValue: ThemeContextValue = {
    theme,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Convenience hook for accessing theme values directly
export function useThemeValues() {
  const { theme } = useTheme();
  return theme;
}

// Helper function to create responsive styles
export function createThemedStyles<T extends Record<string, any>>(
  styleFactory: (theme: Theme) => T
) {
  return (theme: Theme): T => styleFactory(theme);
}