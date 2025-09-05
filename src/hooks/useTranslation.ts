import { useAppContext } from '../context/AppContext';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

type TranslationKeys = typeof en;
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<TranslationKeys>;

const translations = {
  en,
  ar,
} as const;

export function useTranslation() {
  const { state } = useAppContext();
  const currentLanguage = state.language;

  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          value = value?.[fallbackKey];
          if (value === undefined) {
            console.warn(`Translation key "${key}" not found`);
            return key; // Return the key itself as fallback
          }
        }
        break;
      }
    }
    
    return value || key;
  };

  return {
    t,
    language: currentLanguage,
    isRTL: currentLanguage === 'ar',
  };
}

// Utility function for components that need translation without context
export function getTranslation(language: 'en' | 'ar', key: TranslationKey): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English
      value = translations.en;
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
        if (value === undefined) {
          return key;
        }
      }
      break;
    }
  }
  
  return value || key;
}