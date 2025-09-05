export const isRTL = (text: string): boolean => {
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/;
  return rtlRegex.test(text);
};

// Arabic numerals conversion
const westernToArabicNumerals: { [key: string]: string } = {
  '0': '٠',
  '1': '١', 
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩',
};

export const convertToArabicNumerals = (text: string): string => {
  return text.replace(/[0-9]/g, (digit) => westernToArabicNumerals[digit] || digit);
};

export const formatTime = (date: Date, useArabicNumerals = false): string => {
  const timeString = date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return useArabicNumerals ? convertToArabicNumerals(timeString) : timeString;
};

export const formatArabicDate = (date: Date, useArabicNumerals = false): string => {
  const dateString = date.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return useArabicNumerals ? convertToArabicNumerals(dateString) : dateString;
};

export const formatArabicDateShort = (date: Date, useArabicNumerals = false): string => {
  const dateString = date.toLocaleDateString('ar-SA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return useArabicNumerals ? convertToArabicNumerals(dateString) : dateString;
};

// Enhanced RTL utilities
export const getFlexDirection = (isRTL: boolean): 'row' | 'row-reverse' => {
  return isRTL ? 'row-reverse' : 'row';
};

export const getTextAlign = (isRTL: boolean): 'left' | 'right' => {
  return isRTL ? 'right' : 'left';
};

export const getWritingDirection = (isRTL: boolean): 'ltr' | 'rtl' => {
  return isRTL ? 'rtl' : 'ltr';
};

// Re-export task collision utilities
export * from './taskCollision';

// Re-export validation utilities
export * from './validation';