import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { useThemeValues } from '../context/ThemeContext';

export default function LanguageToggle() {
  const { state, actions } = useAppContext();
  const { t } = useTranslation();
  const theme = useThemeValues();

  const toggleLanguage = () => {
    const newLanguage = state.language === 'en' ? 'ar' : 'en';
    actions.setLanguage(newLanguage);
  };

  const toggleArabicNumerals = () => {
    actions.setArabicNumerals(!state.useArabicNumerals);
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surface.secondary,
      borderRadius: theme.layout.borderRadius.md,
      marginVertical: theme.spacing.xs,
    },
    button: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.layout.borderRadius.sm,
      marginHorizontal: theme.spacing.xs,
    },
    activeButton: {
      backgroundColor: theme.colors.primary,
    },
    inactiveButton: {
      backgroundColor: theme.colors.surface.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    activeText: {
      color: theme.colors.text.inverse,
    },
    inactiveText: {
      color: theme.colors.text.primary,
    },
    divider: {
      width: 1,
      height: 30,
      backgroundColor: theme.colors.border.light,
      marginHorizontal: theme.spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      {/* Language Toggle */}
      <TouchableOpacity
        style={[styles.button, state.language === 'en' ? styles.activeButton : styles.inactiveButton]}
        onPress={() => actions.setLanguage('en')}
      >
        <Text style={[styles.buttonText, state.language === 'en' ? styles.activeText : styles.inactiveText]}>
          EN
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, state.language === 'ar' ? styles.activeButton : styles.inactiveButton]}
        onPress={() => actions.setLanguage('ar')}
      >
        <Text style={[styles.buttonText, state.language === 'ar' ? styles.activeText : styles.inactiveText]}>
          عربي
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Arabic Numerals Toggle */}
      <TouchableOpacity
        style={[styles.button, state.useArabicNumerals ? styles.activeButton : styles.inactiveButton]}
        onPress={toggleArabicNumerals}
        disabled={state.language !== 'ar'}
      >
        <Text style={[
          styles.buttonText, 
          state.useArabicNumerals ? styles.activeText : styles.inactiveText,
          { opacity: state.language !== 'ar' ? 0.5 : 1 }
        ]}>
          ١٢٣
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, !state.useArabicNumerals ? styles.activeButton : styles.inactiveButton]}
        onPress={toggleArabicNumerals}
        disabled={state.language !== 'ar'}
      >
        <Text style={[
          styles.buttonText, 
          !state.useArabicNumerals ? styles.activeText : styles.inactiveText,
          { opacity: state.language !== 'ar' ? 0.5 : 1 }
        ]}>
          123
        </Text>
      </TouchableOpacity>
    </View>
  );
}