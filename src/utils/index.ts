export const isRTL = (text: string): boolean => {
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/;
  return rtlRegex.test(text);
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};