export const APP_NAME = 'Time Jewel - جوهرة الوقت';

// Color System
export const COLORS = {
  // Brand Colors
  primary: '#007AFF',
  secondary: '#5856D6',
  
  // Background System (slate-50 to blue-50 gradient)
  background: {
    primary: '#F8FAFC',      // slate-50
    secondary: '#EFF6FF',    // blue-50
    gradient: ['#F8FAFC', '#EFF6FF'],
  },
  
  // Surface Colors
  surface: {
    primary: '#FFFFFF',      // white cards
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text Colors
  text: {
    primary: '#1F2937',      // dark gray titles
    secondary: '#6B7280',    // light gray secondary
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    disabled: '#D1D5DB',
  },
  
  // Task Colors (varied colors: blue, green, purple, etc.)
  task: {
    blue: '#3B82F6',
    green: '#10B981',
    purple: '#8B5CF6',
    pink: '#EC4899',
    yellow: '#F59E0B',
    red: '#EF4444',
    indigo: '#6366F1',
    teal: '#14B8A6',
    orange: '#F97316',
    cyan: '#06B6D4',
  },
  
  // State Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Border Colors
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
  
  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.10)',
    dark: 'rgba(0, 0, 0, 0.15)',
  },
  
  // Legacy colors for backward compatibility
  textSecondary: '#6B7280',
};

// Typography System
export const TYPOGRAPHY = {
  // Font Sizes
  size: {
    xs: 10,    // Extra small text
    sm: 12,    // Body text (12px regular)
    base: 14,  // Subtitles (14px semibold)
    lg: 16,    // Large text
    xl: 18,    // Extra large
    '2xl': 20, // Main title (20px bold)
    '3xl': 24, // Section headers
    '4xl': 32, // Display text
  },
  
  // Font Weights
  weight: {
    light: '300',
    regular: '400',    // Body text
    medium: '500',
    semibold: '600',   // Subtitles
    bold: '700',       // Main title
    extrabold: '800',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
  
  // Font Families (with Arabic support)
  family: {
    system: 'System',
    arabic: 'Arial', // Fallback for Arabic, will be enhanced with custom fonts
  },
};

// Spacing System
export const SPACING = {
  // Base spacing units
  xs: 4,     // Extra small spacing
  sm: 8,     // Card margins (8px)
  base: 12,  // Base spacing
  md: 16,    // General padding (16px)
  lg: 20,    // Large spacing
  xl: 24,    // Extra large spacing
  '2xl': 32, // Section spacing
  '3xl': 48, // Page spacing
  '4xl': 64, // Large sections
  
  // Grid system
  grid: {
    gap: 4,    // Grid gap (4px)
    gutter: 16, // Grid gutters
  },
};

// Layout System
export const LAYOUT = {
  // Padding (maintaining backward compatibility)
  padding: SPACING.md,   // 16px
  margin: SPACING.sm,    // 8px
  
  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,     // 8px for cards
    md: 12,
    lg: 16,
    full: 9999,  // Full radius for buttons
  },
  
  // Shadows
  shadow: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: COLORS.shadow.light,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: COLORS.shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: COLORS.shadow.dark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  
  // Breakpoints (for future responsive design)
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
};

// Animation System
export const ANIMATION = {
  // Duration
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Easing
  easing: {
    ease: [0.4, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
  },
};

// Task Color Palette (for easy selection)
export const TASK_COLORS = [
  COLORS.task.blue,
  COLORS.task.green,
  COLORS.task.purple,
  COLORS.task.pink,
  COLORS.task.yellow,
  COLORS.task.red,
  COLORS.task.indigo,
  COLORS.task.teal,
  COLORS.task.orange,
  COLORS.task.cyan,
];