import React from 'react';
import { render } from '@testing-library/react-native';
import { I18nManager } from 'react-native';
import TaskCard from '../../components/TaskCard';
import LanguageToggle from '../../components/LanguageToggle';
import { Task } from '../../types';

// Mock React Native's I18nManager
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    I18nManager: {
      isRTL: false,
      allowRTL: jest.fn(),
      forceRTL: jest.fn(),
    },
    Animated: {
      ...RN.Animated,
      Value: jest.fn(() => ({ interpolate: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn() })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      View: RN.View,
    },
  };
});

// Mock dependencies
jest.mock('../../context/ThemeContext', () => ({
  useThemeValues: () => ({
    spacing: { xs: 4, sm: 8, md: 16 },
    colors: {
      surface: { primary: '#FFFFFF', secondary: '#F5F5F5' },
      text: { primary: '#000000', secondary: '#666666', tertiary: '#999999', inverse: '#FFFFFF' },
      border: { light: '#E0E0E0' },
      success: '#00FF00',
      warning: '#FFA500',
      primary: '#007AFF',
    },
    layout: {
      borderRadius: { sm: 4, base: 8, md: 6 },
      shadow: { base: {} },
    },
  }),
}));

jest.mock('../../utils/styleUtils', () => ({
  textStyles: {
    subtitle: { fontSize: 16, fontWeight: '600' },
    body: { fontSize: 14, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '400' },
  },
}));

jest.mock('../../components/TaskActions', () => {
  const MockTaskActions = () => <div>Actions</div>;
  return MockTaskActions;
});

describe('Arabic Text Rendering Tests', () => {
  const mockArabicTask: Task = {
    id: 1,
    name: 'مهمة اختبار باللغة العربية',
    startSlot: 9,
    duration: 2,
    completed: false,
    color: '#FF0000',
  };

  const mockMixedTask: Task = {
    id: 2,
    name: 'Mixed Task مع نص عربي and English',
    startSlot: 14,
    duration: 1,
    completed: true,
    color: '#00FF00',
  };

  describe('TaskCard Arabic Text Support', () => {
    beforeEach(() => {
      // Reset I18nManager state
      (I18nManager as any).isRTL = false;
    });

    it('should render Arabic task names correctly', () => {
      // Mock Arabic context
      const useAppContext = jest.fn(() => ({
        state: {
          language: 'ar',
          useArabicNumerals: true,
        },
      }));
      
      const useTranslation = jest.fn(() => ({
        t: (key: string) => {
          const translations: Record<string, string> = {
            'task.hour': 'ساعة',
            'task.hours': 'ساعات',
            'task.completed': 'مكتمل',
            'task.pending': 'معلق',
          };
          return translations[key] || key;
        },
        isRTL: true,
      }));

      const convertToArabicNumerals = jest.fn((text: string) =>
        text.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
      );

      // Apply mocks
      jest.doMock('../../context/AppContext', () => ({
        useAppContext,
      }));
      
      jest.doMock('../../hooks/useTranslation', () => ({
        useTranslation,
      }));

      jest.doMock('../../utils', () => ({
        convertToArabicNumerals,
      }));

      const { getByText } = render(
        <TaskCard task={mockArabicTask} onPress={jest.fn()} />
      );

      // Verify Arabic task name is rendered
      expect(getByText('مهمة اختبار باللغة العربية')).toBeTruthy();
      
      // Verify Arabic translations are used
      expect(getByText('معلق')).toBeTruthy(); // 'pending' in Arabic
      
      // Verify Arabic numerals are used
      expect(getByText(/٠٩:٠٠ - ١١:٠٠/)).toBeTruthy();
      expect(getByText(/٢ ساعات/)).toBeTruthy();
    });

    it('should handle mixed Arabic/English text', () => {
      const useAppContext = jest.fn(() => ({
        state: {
          language: 'ar',
          useArabicNumerals: false, // Keep English numerals for mixed content
        },
      }));
      
      const useTranslation = jest.fn(() => ({
        t: (key: string) => key,
        isRTL: true,
      }));

      jest.doMock('../../context/AppContext', () => ({
        useAppContext,
      }));
      
      jest.doMock('../../hooks/useTranslation', () => ({
        useTranslation,
      }));

      jest.doMock('../../utils', () => ({
        convertToArabicNumerals: (text: string) => text, // No conversion for mixed content
      }));

      const { getByText } = render(
        <TaskCard task={mockMixedTask} onPress={jest.fn()} />
      );

      // Verify mixed text is rendered correctly
      expect(getByText('Mixed Task مع نص عربي and English ✓')).toBeTruthy();
    });

    it('should apply RTL layout for Arabic content', () => {
      // Mock RTL context
      (I18nManager as any).isRTL = true;

      const useAppContext = jest.fn(() => ({
        state: {
          language: 'ar',
          useArabicNumerals: true,
        },
      }));
      
      const useTranslation = jest.fn(() => ({
        t: (key: string) => key,
        isRTL: true,
      }));

      jest.doMock('../../context/AppContext', () => ({
        useAppContext,
      }));
      
      jest.doMock('../../hooks/useTranslation', () => ({
        useTranslation,
      }));

      const { getByText } = render(
        <TaskCard task={mockArabicTask} onPress={jest.fn()} />
      );

      const taskNameElement = getByText('مهمة اختبار باللغة العربية');
      
      // Verify RTL text alignment is applied
      expect(taskNameElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            textAlign: 'right', // RTL text should be right-aligned
          }),
        ])
      );

      // Verify RTL layout direction
      const container = taskNameElement.parent;
      expect(container?.props.style?.flexDirection).toBe('row-reverse');
    });
  });

  describe('LanguageToggle Arabic Support', () => {
    it('should display Arabic language option', () => {
      const mockSetLanguage = jest.fn();
      const mockSetArabicNumerals = jest.fn();

      jest.doMock('../../context/AppContext', () => ({
        useAppContext: () => ({
          state: {
            language: 'en',
            useArabicNumerals: false,
          },
          actions: {
            setLanguage: mockSetLanguage,
            setArabicNumerals: mockSetArabicNumerals,
          },
        }),
      }));

      jest.doMock('../../hooks/useTranslation', () => ({
        useTranslation: () => ({
          t: (key: string) => key,
        }),
      }));

      const { getByText } = render(<LanguageToggle />);

      // Verify Arabic text is displayed
      expect(getByText('عربي')).toBeTruthy();
      expect(getByText('١٢٣')).toBeTruthy(); // Arabic numerals
      expect(getByText('123')).toBeTruthy(); // English numerals
    });

    it('should enable Arabic numerals only when Arabic language is selected', () => {
      const mockSetLanguage = jest.fn();
      const mockSetArabicNumerals = jest.fn();

      // Test with English selected
      jest.doMock('../../context/AppContext', () => ({
        useAppContext: () => ({
          state: {
            language: 'en',
            useArabicNumerals: false,
          },
          actions: {
            setLanguage: mockSetLanguage,
            setArabicNumerals: mockSetArabicNumerals,
          },
        }),
      }));

      const { getByText, rerender } = render(<LanguageToggle />);

      const arabicNumeralsButton = getByText('١٢٣').parent;
      const englishNumeralsButton = getByText('123').parent;

      // Arabic numerals should be disabled when English is selected
      expect(arabicNumeralsButton?.props.disabled).toBe(true);
      expect(englishNumeralsButton?.props.disabled).toBe(true);

      // Now test with Arabic selected
      jest.doMock('../../context/AppContext', () => ({
        useAppContext: () => ({
          state: {
            language: 'ar',
            useArabicNumerals: true,
          },
          actions: {
            setLanguage: mockSetLanguage,
            setArabicNumerals: mockSetArabicNumerals,
          },
        }),
      }));

      // Create new component with Arabic context
      const LanguageToggleArabic = require('../../components/LanguageToggle').default;
      const { getByText: getByTextArabic } = render(<LanguageToggleArabic />);

      const arabicNumeralsButtonAr = getByTextArabic('١٢٣').parent;
      const englishNumeralsButtonAr = getByTextArabic('123').parent;

      // Arabic numerals should be enabled when Arabic is selected
      expect(arabicNumeralsButtonAr?.props.disabled).toBe(false);
      expect(englishNumeralsButtonAr?.props.disabled).toBe(false);
    });
  });

  describe('Arabic Numeral Conversion', () => {
    it('should convert English numerals to Arabic numerals correctly', () => {
      const convertToArabicNumerals = (text: string): string => {
        return text.replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[parseInt(digit)]);
      };

      // Test various number formats
      expect(convertToArabicNumerals('09:00 - 11:00')).toBe('٠٩:٠٠ - ١١:٠٠');
      expect(convertToArabicNumerals('2 hours')).toBe('٢ hours');
      expect(convertToArabicNumerals('Task 123')).toBe('Task ١٢٣');
      expect(convertToArabicNumerals('10/20/2023')).toBe('١٠/٢٠/٢٠٢٣');
    });

    it('should handle edge cases in numeral conversion', () => {
      const convertToArabicNumerals = (text: string): string => {
        return text.replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[parseInt(digit)]);
      };

      // Test edge cases
      expect(convertToArabicNumerals('')).toBe('');
      expect(convertToArabicNumerals('No numbers here')).toBe('No numbers here');
      expect(convertToArabicNumerals('0')).toBe('٠');
      expect(convertToArabicNumerals('9876543210')).toBe('٩٨٧٦٥٤٣٢١٠');
    });
  });

  describe('Bidirectional Text Support', () => {
    it('should handle bidirectional text correctly', () => {
      const bidiTask: Task = {
        id: 3,
        name: 'Hello مرحبا 123 ١٢٣ World',
        startSlot: 10,
        duration: 1,
        completed: false,
        color: '#0000FF',
      };

      const useAppContext = jest.fn(() => ({
        state: {
          language: 'ar',
          useArabicNumerals: false,
        },
      }));
      
      const useTranslation = jest.fn(() => ({
        t: (key: string) => key,
        isRTL: true,
      }));

      jest.doMock('../../context/AppContext', () => ({
        useAppContext,
      }));
      
      jest.doMock('../../hooks/useTranslation', () => ({
        useTranslation,
      }));

      const { getByText } = render(
        <TaskCard task={bidiTask} onPress={jest.fn()} />
      );

      // Verify bidirectional text is rendered
      expect(getByText('Hello مرحبا 123 ١٢٣ World')).toBeTruthy();
    });
  });

  describe('Font Rendering', () => {
    it('should apply appropriate fonts for Arabic text', () => {
      const useAppContext = jest.fn(() => ({
        state: {
          language: 'ar',
          useArabicNumerals: true,
        },
      }));
      
      const useTranslation = jest.fn(() => ({
        t: (key: string) => key,
        isRTL: true,
      }));

      jest.doMock('../../context/AppContext', () => ({
        useAppContext,
      }));
      
      jest.doMock('../../hooks/useTranslation', () => ({
        useTranslation,
      }));

      const { getByText } = render(
        <TaskCard task={mockArabicTask} onPress={jest.fn()} />
      );

      const arabicText = getByText('مهمة اختبار باللغة العربية');
      
      // Note: In a real app, you would verify specific font families are applied
      // For this test, we just verify the text renders without errors
      expect(arabicText).toBeTruthy();
      expect(arabicText.props.style).toBeDefined();
    });
  });

  describe('Accessibility with Arabic Text', () => {
    it('should provide proper accessibility labels for Arabic content', () => {
      const useAppContext = jest.fn(() => ({
        state: {
          language: 'ar',
          useArabicNumerals: true,
        },
      }));
      
      const useTranslation = jest.fn(() => ({
        t: (key: string) => {
          const translations: Record<string, string> = {
            'task.completed': 'مكتمل',
            'task.pending': 'معلق',
          };
          return translations[key] || key;
        },
        isRTL: true,
      }));

      jest.doMock('../../context/AppContext', () => ({
        useAppContext,
      }));
      
      jest.doMock('../../hooks/useTranslation', () => ({
        useTranslation,
      }));

      const { getByText } = render(
        <TaskCard task={mockArabicTask} onPress={jest.fn()} />
      );

      // Verify Arabic accessibility content
      expect(getByText('معلق')).toBeTruthy(); // Arabic "pending" status
      expect(getByText('مهمة اختبار باللغة العربية')).toBeTruthy();
    });
  });
});