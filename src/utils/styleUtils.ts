import { TextStyle, ViewStyle } from 'react-native';
import { TYPOGRAPHY, COLORS, LAYOUT, SPACING } from '../constants';

// Typography utility functions
export const createTextStyle = (options: {
  size?: keyof typeof TYPOGRAPHY.size;
  weight?: keyof typeof TYPOGRAPHY.weight;
  color?: string;
  lineHeight?: keyof typeof TYPOGRAPHY.lineHeight;
  letterSpacing?: keyof typeof TYPOGRAPHY.letterSpacing;
  textAlign?: 'left' | 'center' | 'right' | 'auto';
  fontFamily?: string;
}): TextStyle => {
  const {
    size = 'base',
    weight = 'regular',
    color = COLORS.text.primary,
    lineHeight = 'normal',
    letterSpacing = 'normal',
    textAlign = 'left',
    fontFamily,
  } = options;

  return {
    fontSize: TYPOGRAPHY.size[size],
    fontWeight: TYPOGRAPHY.weight[weight],
    color,
    lineHeight: TYPOGRAPHY.size[size] * TYPOGRAPHY.lineHeight[lineHeight],
    letterSpacing: TYPOGRAPHY.letterSpacing[letterSpacing],
    textAlign,
    ...(fontFamily && { fontFamily }),
  };
};

// Common text styles
export const textStyles = {
  // Main title (20px bold with potential gradient support)
  title: createTextStyle({
    size: '2xl',
    weight: 'bold',
    color: COLORS.text.primary,
  }),
  
  // Subtitles (14px semibold)
  subtitle: createTextStyle({
    size: 'base',
    weight: 'semibold',
    color: COLORS.text.primary,
  }),
  
  // Body text (12px regular)
  body: createTextStyle({
    size: 'sm',
    weight: 'regular',
    color: COLORS.text.primary,
  }),
  
  // Secondary text
  secondary: createTextStyle({
    size: 'sm',
    weight: 'regular',
    color: COLORS.text.secondary,
  }),
  
  // Caption text
  caption: createTextStyle({
    size: 'xs',
    weight: 'regular',
    color: COLORS.text.tertiary,
  }),
  
  // Button text
  button: createTextStyle({
    size: 'base',
    weight: 'semibold',
    color: COLORS.text.inverse,
  }),
};

// Container utility functions
export const createContainerStyle = (options: {
  padding?: keyof typeof SPACING;
  paddingHorizontal?: keyof typeof SPACING;
  paddingVertical?: keyof typeof SPACING;
  margin?: keyof typeof SPACING;
  marginHorizontal?: keyof typeof SPACING;
  marginVertical?: keyof typeof SPACING;
  backgroundColor?: string;
  borderRadius?: keyof typeof LAYOUT.borderRadius;
  shadow?: keyof typeof LAYOUT.shadow;
  borderColor?: string;
  borderWidth?: number;
}): ViewStyle => {
  const {
    padding,
    paddingHorizontal,
    paddingVertical,
    margin,
    marginHorizontal,
    marginVertical,
    backgroundColor,
    borderRadius,
    shadow,
    borderColor,
    borderWidth,
  } = options;

  return {
    ...(padding && { padding: SPACING[padding] }),
    ...(paddingHorizontal && { paddingHorizontal: SPACING[paddingHorizontal] }),
    ...(paddingVertical && { paddingVertical: SPACING[paddingVertical] }),
    ...(margin && { margin: SPACING[margin] }),
    ...(marginHorizontal && { marginHorizontal: SPACING[marginHorizontal] }),
    ...(marginVertical && { marginVertical: SPACING[marginVertical] }),
    ...(backgroundColor && { backgroundColor }),
    ...(borderRadius && { borderRadius: LAYOUT.borderRadius[borderRadius] }),
    ...(shadow && LAYOUT.shadow[shadow]),
    ...(borderColor && { borderColor }),
    ...(borderWidth && { borderWidth }),
  };
};

// Card utility function
export const createCardStyle = (options: {
  elevated?: boolean;
  padding?: keyof typeof SPACING;
  margin?: keyof typeof SPACING;
  borderRadius?: keyof typeof LAYOUT.borderRadius;
} = {}): ViewStyle => {
  const {
    elevated = true,
    padding = 'md',
    margin = 'sm',
    borderRadius = 'base',
  } = options;

  return createContainerStyle({
    backgroundColor: COLORS.surface.primary,
    padding,
    margin,
    borderRadius,
    shadow: elevated ? 'base' : 'none',
  });
};

// Button utility function
export const createButtonStyle = (options: {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
} = {}): ViewStyle => {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
  } = options;

  const baseStyle: ViewStyle = {
    borderRadius: LAYOUT.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  };

  // Size variations
  const sizeStyles = {
    sm: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      minHeight: 32,
    },
    md: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      minHeight: 44,
    },
    lg: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.base,
      minHeight: 52,
    },
  };

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: disabled ? COLORS.text.disabled : COLORS.primary,
    },
    secondary: {
      backgroundColor: disabled ? COLORS.text.disabled : COLORS.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: disabled ? COLORS.text.disabled : COLORS.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(fullWidth && { width: '100%' }),
    ...(disabled && { opacity: 0.6 }),
  };
};

// Spacing utilities
export const spacing = {
  // Padding utilities
  p: (size: keyof typeof SPACING) => ({ padding: SPACING[size] }),
  px: (size: keyof typeof SPACING) => ({ paddingHorizontal: SPACING[size] }),
  py: (size: keyof typeof SPACING) => ({ paddingVertical: SPACING[size] }),
  pt: (size: keyof typeof SPACING) => ({ paddingTop: SPACING[size] }),
  pb: (size: keyof typeof SPACING) => ({ paddingBottom: SPACING[size] }),
  pl: (size: keyof typeof SPACING) => ({ paddingLeft: SPACING[size] }),
  pr: (size: keyof typeof SPACING) => ({ paddingRight: SPACING[size] }),

  // Margin utilities
  m: (size: keyof typeof SPACING) => ({ margin: SPACING[size] }),
  mx: (size: keyof typeof SPACING) => ({ marginHorizontal: SPACING[size] }),
  my: (size: keyof typeof SPACING) => ({ marginVertical: SPACING[size] }),
  mt: (size: keyof typeof SPACING) => ({ marginTop: SPACING[size] }),
  mb: (size: keyof typeof SPACING) => ({ marginBottom: SPACING[size] }),
  ml: (size: keyof typeof SPACING) => ({ marginLeft: SPACING[size] }),
  mr: (size: keyof typeof SPACING) => ({ marginRight: SPACING[size] }),
};

// Layout utilities
export const layout = {
  // Flexbox utilities
  flex: (value: number = 1) => ({ flex: value }),
  flexRow: () => ({ flexDirection: 'row' as const }),
  flexCol: () => ({ flexDirection: 'column' as const }),
  itemsCenter: () => ({ alignItems: 'center' as const }),
  itemsStart: () => ({ alignItems: 'flex-start' as const }),
  itemsEnd: () => ({ alignItems: 'flex-end' as const }),
  justifyCenter: () => ({ justifyContent: 'center' as const }),
  justifyStart: () => ({ justifyContent: 'flex-start' as const }),
  justifyEnd: () => ({ justifyContent: 'flex-end' as const }),
  justifyBetween: () => ({ justifyContent: 'space-between' as const }),
  justifyAround: () => ({ justifyContent: 'space-around' as const }),

  // Position utilities
  absolute: () => ({ position: 'absolute' as const }),
  relative: () => ({ position: 'relative' as const }),
  
  // Size utilities
  wFull: () => ({ width: '100%' }),
  hFull: () => ({ height: '100%' }),
  square: (size: number) => ({ width: size, height: size }),
  
  // Border radius utilities
  rounded: (size: keyof typeof LAYOUT.borderRadius) => ({ 
    borderRadius: LAYOUT.borderRadius[size] 
  }),
  
  // Shadow utilities
  shadow: (size: keyof typeof LAYOUT.shadow) => LAYOUT.shadow[size],
};

// Color utilities
export const colors = {
  bg: (color: string) => ({ backgroundColor: color }),
  text: (color: string) => ({ color }),
  border: (color: string) => ({ borderColor: color }),
};

// Combined utility for easier usage
export const styles = {
  ...spacing,
  ...layout,
  ...colors,
  text: textStyles,
  card: createCardStyle,
  button: createButtonStyle,
  container: createContainerStyle,
};