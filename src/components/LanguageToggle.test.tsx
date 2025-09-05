import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LanguageToggle from './LanguageToggle';

// Mock dependencies
const mockSetLanguage = jest.fn();
const mockSetArabicNumerals = jest.fn();

jest.mock('../context/AppContext', () => ({
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

jest.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../context/ThemeContext', () => ({
  useThemeValues: () => ({
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
    },
    colors: {
      surface: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
      },
      primary: '#007AFF',
      text: {
        primary: '#000000',
        inverse: '#FFFFFF',
      },
      border: {
        light: '#E0E0E0',
      },
    },
    layout: {
      borderRadius: {
        sm: 4,
        md: 8,
      },
    },
  }),
}));

describe('LanguageToggle', () => {
  beforeEach(() => {
    mockSetLanguage.mockClear();
    mockSetArabicNumerals.mockClear();
  });

  it('should render language toggle buttons', () => {
    const { getByText } = render(<LanguageToggle />);

    expect(getByText('EN')).toBeTruthy();
    expect(getByText('عربي')).toBeTruthy();
  });

  it('should render arabic numerals toggle buttons', () => {
    const { getByText } = render(<LanguageToggle />);

    expect(getByText('١٢٣')).toBeTruthy();
    expect(getByText('123')).toBeTruthy();
  });

  it('should set language to English when EN button is pressed', () => {
    const { getByText } = render(<LanguageToggle />);

    fireEvent.press(getByText('EN'));
    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('should set language to Arabic when Arabic button is pressed', () => {
    const { getByText } = render(<LanguageToggle />);

    fireEvent.press(getByText('عربي'));
    expect(mockSetLanguage).toHaveBeenCalledWith('ar');
  });

  it('should toggle Arabic numerals when arabic numeral button is pressed', () => {
    const { getByText } = render(<LanguageToggle />);

    fireEvent.press(getByText('١٢٣'));
    expect(mockSetArabicNumerals).toHaveBeenCalledWith(true);
  });

  it('should toggle Arabic numerals when english numeral button is pressed', () => {
    const { getByText } = render(<LanguageToggle />);

    fireEvent.press(getByText('123'));
    expect(mockSetArabicNumerals).toHaveBeenCalledWith(true);
  });

  describe('when Arabic language is selected', () => {
    beforeEach(() => {
      // Mock Arabic language state
      const useAppContext = require('../context/AppContext').useAppContext;
      useAppContext.mockReturnValue({
        state: {
          language: 'ar',
          useArabicNumerals: true,
        },
        actions: {
          setLanguage: mockSetLanguage,
          setArabicNumerals: mockSetArabicNumerals,
        },
      });
    });

    it('should show Arabic button as active', () => {
      const { getByText } = render(<LanguageToggle />);
      
      const arabicButton = getByText('عربي').parent;
      const englishButton = getByText('EN').parent;
      
      // Arabic button should have active styles
      expect(arabicButton?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#007AFF', // primary color
          }),
        ])
      );
      
      // English button should have inactive styles
      expect(englishButton?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#FFFFFF', // surface primary
          }),
        ])
      );
    });

    it('should enable Arabic numerals buttons', () => {
      const { getByText } = render(<LanguageToggle />);
      
      const arabicNumeralsButton = getByText('١٢٣').parent;
      const englishNumeralsButton = getByText('123').parent;
      
      expect(arabicNumeralsButton?.props.disabled).toBe(false);
      expect(englishNumeralsButton?.props.disabled).toBe(false);
    });
  });

  describe('when English language is selected', () => {
    it('should show English button as active', () => {
      const { getByText } = render(<LanguageToggle />);
      
      const englishButton = getByText('EN').parent;
      const arabicButton = getByText('عربي').parent;
      
      // English button should have active styles
      expect(englishButton?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#007AFF', // primary color
          }),
        ])
      );
      
      // Arabic button should have inactive styles
      expect(arabicButton?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#FFFFFF', // surface primary
          }),
        ])
      );
    });

    it('should disable Arabic numerals buttons', () => {
      const { getByText } = render(<LanguageToggle />);
      
      const arabicNumeralsButton = getByText('١٢٣').parent;
      const englishNumeralsButton = getByText('123').parent;
      
      expect(arabicNumeralsButton?.props.disabled).toBe(true);
      expect(englishNumeralsButton?.props.disabled).toBe(true);
    });

    it('should show Arabic numerals buttons with reduced opacity', () => {
      const { getByText } = render(<LanguageToggle />);
      
      const arabicNumeralsText = getByText('١٢٣');
      const englishNumeralsText = getByText('123');
      
      expect(arabicNumeralsText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            opacity: 0.5,
          }),
        ])
      );
      
      expect(englishNumeralsText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            opacity: 0.5,
          }),
        ])
      );
    });
  });

  describe('Arabic numerals state', () => {
    it('should show correct active state when Arabic numerals are enabled', () => {
      // Mock state with Arabic numerals enabled
      const useAppContext = require('../context/AppContext').useAppContext;
      useAppContext.mockReturnValue({
        state: {
          language: 'ar',
          useArabicNumerals: true,
        },
        actions: {
          setLanguage: mockSetLanguage,
          setArabicNumerals: mockSetArabicNumerals,
        },
      });

      const { getByText } = render(<LanguageToggle />);
      
      const arabicNumeralsButton = getByText('١٢٣').parent;
      const englishNumeralsButton = getByText('123').parent;
      
      // Arabic numerals button should be active
      expect(arabicNumeralsButton?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#007AFF', // primary color
          }),
        ])
      );
      
      // English numerals button should be inactive
      expect(englishNumeralsButton?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#FFFFFF', // surface primary
          }),
        ])
      );
    });

    it('should toggle to false when Arabic numerals button is pressed and currently true', () => {
      // Mock state with Arabic numerals enabled
      const useAppContext = require('../context/AppContext').useAppContext;
      useAppContext.mockReturnValue({
        state: {
          language: 'ar',
          useArabicNumerals: true,
        },
        actions: {
          setLanguage: mockSetLanguage,
          setArabicNumerals: mockSetArabicNumerals,
        },
      });

      const { getByText } = render(<LanguageToggle />);

      fireEvent.press(getByText('١٢٣'));
      expect(mockSetArabicNumerals).toHaveBeenCalledWith(false);
    });
  });
});