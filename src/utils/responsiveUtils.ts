import { Dimensions, PixelRatio, Platform } from 'react-native';

// Device information
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const deviceScale = Dimensions.get('window').scale;
const pixelDensity = PixelRatio.get();

// Device categories based on screen width
export const DEVICE_SIZES = {
  // Phone sizes (320px - 428px width)
  SMALL_PHONE: 320,     // iPhone SE, small Android
  MEDIUM_PHONE: 375,    // iPhone 12, 13, 14
  LARGE_PHONE: 414,     // iPhone 12 Pro Max, Plus models
  EXTRA_LARGE_PHONE: 428, // iPhone 14 Pro Max
  
  // Tablet sizes (768px+ width)  
  TABLET: 768,          // iPad, Android tablets
  LARGE_TABLET: 1024,   // iPad Pro
} as const;

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: 0,              // Extra small devices
  sm: 320,            // Small phones
  md: 375,            // Medium phones  
  lg: 414,            // Large phones
  xl: 768,            // Tablets
  xxl: 1024,          // Large tablets
} as const;

// Device type detection
export const getDeviceType = () => {
  if (screenWidth < DEVICE_SIZES.TABLET) {
    if (screenWidth <= DEVICE_SIZES.SMALL_PHONE) return 'small-phone';
    if (screenWidth <= DEVICE_SIZES.MEDIUM_PHONE) return 'medium-phone';
    if (screenWidth <= DEVICE_SIZES.LARGE_PHONE) return 'large-phone';
    return 'extra-large-phone';
  }
  
  if (screenWidth >= DEVICE_SIZES.LARGE_TABLET) return 'large-tablet';
  return 'tablet';
};

// Device dimensions
export const DEVICE_INFO = {
  width: screenWidth,
  height: screenHeight,
  scale: deviceScale,
  pixelDensity,
  type: getDeviceType(),
  isSmallDevice: screenWidth < DEVICE_SIZES.MEDIUM_PHONE,
  isTablet: screenWidth >= DEVICE_SIZES.TABLET,
  isPhone: screenWidth < DEVICE_SIZES.TABLET,
  hasNotch: screenHeight >= 812 && Platform.OS === 'ios', // iPhone X+ detection
} as const;

// Touch target utilities
export const TOUCH_TARGETS = {
  // Minimum recommended touch targets
  MIN_SIZE: 44,         // Apple/Android minimum
  COMFORTABLE_SIZE: 48, // More comfortable size
  LARGE_SIZE: 56,       // Large touch targets
  
  // Context-specific sizes
  ICON_BUTTON: 44,
  PRIMARY_BUTTON: 48,
  FAB: 56,
  MODAL_BUTTON: 52,
} as const;

// Responsive scaling functions
export const scaleSize = (size: number): number => {
  const baseScale = screenWidth / DEVICE_SIZES.MEDIUM_PHONE;
  const clampedScale = Math.min(Math.max(baseScale, 0.85), 1.3);
  return Math.round(PixelRatio.roundToNearestPixel(size * clampedScale));
};

// Vertical scaling (for height-dependent elements)
export const verticalScale = (size: number): number => {
  const baseHeight = 812; // iPhone X base height
  const heightScale = screenHeight / baseHeight;
  const clampedScale = Math.min(Math.max(heightScale, 0.8), 1.2);
  return Math.round(PixelRatio.roundToNearestPixel(size * clampedScale));
};

// Moderate scaling (less aggressive scaling)
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scaleSize(size) - size) * factor;
};

// Font scaling with accessibility support
export const getFontSize = (baseSize: number): number => {
  const fontScale = PixelRatio.getFontScale();
  const scaledSize = scaleSize(baseSize);
  
  // Apply font scale but limit maximum size for readability
  const accessibleSize = scaledSize * fontScale;
  const maxSize = scaledSize * 1.3; // Maximum 30% increase
  
  return Math.min(accessibleSize, maxSize);
};

// Responsive spacing
export const getResponsiveSpacing = (baseSpacing: number): number => {
  if (DEVICE_INFO.isSmallDevice) {
    return Math.max(baseSpacing * 0.75, 4); // Reduce spacing on small devices
  }
  
  if (DEVICE_INFO.isTablet) {
    return baseSpacing * 1.25; // Increase spacing on tablets
  }
  
  return baseSpacing;
};

// Safe area utilities
export const getSafeAreaPadding = () => {
  const basePadding = {
    top: Platform.OS === 'ios' ? 44 : 24,
    bottom: Platform.OS === 'ios' ? (DEVICE_INFO.hasNotch ? 34 : 0) : 0,
    left: 0,
    right: 0,
  };

  // Adjust for different device sizes
  if (DEVICE_INFO.isTablet) {
    return {
      ...basePadding,
      top: basePadding.top + 10,
      bottom: basePadding.bottom + 10,
    };
  }

  if (DEVICE_INFO.isSmallDevice) {
    return {
      ...basePadding,
      top: Math.max(basePadding.top - 8, 20),
    };
  }

  return basePadding;
};

// Breakpoint utilities
export const isBreakpoint = (breakpoint: keyof typeof BREAKPOINTS): boolean => {
  return screenWidth >= BREAKPOINTS[breakpoint];
};

export const getBreakpoint = (): keyof typeof BREAKPOINTS => {
  if (screenWidth >= BREAKPOINTS.xxl) return 'xxl';
  if (screenWidth >= BREAKPOINTS.xl) return 'xl';
  if (screenWidth >= BREAKPOINTS.lg) return 'lg';
  if (screenWidth >= BREAKPOINTS.md) return 'md';
  if (screenWidth >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

// Grid utilities for responsive layouts
export const getGridColumns = (): number => {
  if (DEVICE_INFO.isTablet) return DEVICE_INFO.width >= DEVICE_SIZES.LARGE_TABLET ? 4 : 3;
  if (DEVICE_INFO.isSmallDevice) return 1;
  return 2;
};

// Responsive container padding
export const getContainerPadding = (): number => {
  if (DEVICE_INFO.isTablet) return 24;
  if (DEVICE_INFO.isSmallDevice) return 12;
  return 16;
};

// Touch area expansion for small targets
export const getTouchableArea = (elementSize: number): number => {
  return Math.max(elementSize, TOUCH_TARGETS.MIN_SIZE);
};

// Orientation utilities
export const isLandscape = (): boolean => {
  return screenWidth > screenHeight;
};

export const isPortrait = (): boolean => {
  return screenHeight > screenWidth;
};

// Utility to convert design pixels to device pixels
export const hp = (percentage: number): number => {
  return (percentage * screenHeight) / 100;
};

export const wp = (percentage: number): number => {
  return (percentage * screenWidth) / 100;
};

// Responsive style utilities
export const createResponsiveStyle = <T>(styles: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
}): T | undefined => {
  const currentBreakpoint = getBreakpoint();
  
  // Return the most appropriate style for current breakpoint
  return styles[currentBreakpoint] || 
         styles.lg || 
         styles.md || 
         styles.sm || 
         styles.xs;
};

// Export device info for use in components
export { screenWidth, screenHeight, deviceScale };

// Common responsive values
export const RESPONSIVE_VALUES = {
  // Header heights
  headerHeight: DEVICE_INFO.isTablet ? 80 : DEVICE_INFO.isSmallDevice ? 60 : 70,
  
  // Button sizes
  buttonHeight: DEVICE_INFO.isTablet ? 52 : 44,
  fabSize: DEVICE_INFO.isTablet ? 64 : 56,
  
  // Modal sizes
  modalWidth: Math.min(screenWidth * 0.9, DEVICE_INFO.isTablet ? 600 : 400),
  modalMaxHeight: screenHeight * 0.8,
  
  // Grid gaps
  gridGap: DEVICE_INFO.isTablet ? 16 : DEVICE_INFO.isSmallDevice ? 8 : 12,
  
  // Border radius
  borderRadius: DEVICE_INFO.isTablet ? 12 : 8,
  
  // Icon sizes
  iconSize: DEVICE_INFO.isTablet ? 28 : 24,
  largeIconSize: DEVICE_INFO.isTablet ? 36 : 32,
} as const;