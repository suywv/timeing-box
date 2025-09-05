import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeValues } from '../context/ThemeContext';
import { textStyles } from '../utils/styleUtils';
import { formatArabicDateShort, convertToArabicNumerals } from '../utils';
import { useTranslation } from '../hooks/useTranslation';
import { useAppContext } from '../context/AppContext';
import { 
  TOUCH_TARGETS, 
  getFontSize, 
  getResponsiveSpacing,
  getSafeAreaPadding,
  RESPONSIVE_VALUES,
  DEVICE_INFO
} from '../utils/responsiveUtils';


interface HeaderProps {
  onSettingsPress?: () => void;
  onCalendarPress?: () => void;
}

export default function Header({
  onSettingsPress,
  onCalendarPress,
}: HeaderProps) {
  const theme = useThemeValues();
  const { state } = useAppContext();
  const { t, isRTL } = useTranslation();
  const currentDate = new Date();

  const safeArea = getSafeAreaPadding();
  
  // Create dynamic styles using theme and responsive utilities
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface.primary,
      paddingTop: safeArea.top,
      paddingHorizontal: getResponsiveSpacing(theme.spacing.md),
      paddingBottom: getResponsiveSpacing(theme.spacing.md),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      ...theme.layout.shadow.base,
      height: RESPONSIVE_VALUES.headerHeight,
    },
    headerContent: {
      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: getResponsiveSpacing(theme.spacing.sm),
    },
    iconButton: {
      width: TOUCH_TARGETS.ICON_BUTTON,
      height: TOUCH_TARGETS.ICON_BUTTON,
      borderRadius: TOUCH_TARGETS.ICON_BUTTON / 2,
      backgroundColor: theme.colors.background.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.layout.shadow.sm,
    },
    centerContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: getResponsiveSpacing(theme.spacing.md),
    },
    titleGradient: {
      paddingHorizontal: getResponsiveSpacing(theme.spacing.lg),
      paddingVertical: getResponsiveSpacing(theme.spacing.sm),
      borderRadius: theme.layout.borderRadius.md,
      marginBottom: 4,
    },
    appTitle: {
      ...textStyles.title,
      fontSize: getFontSize(DEVICE_INFO.isTablet ? 28 : DEVICE_INFO.isSmallDevice ? 18 : 24),
      color: theme.colors.text.inverse,
      textAlign: 'center',
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    dateText: {
      ...textStyles.secondary,
      fontSize: getFontSize(DEVICE_INFO.isTablet ? 16 : 14),
      textAlign: 'center',
      fontWeight: '500',
    },
    gridIndicator: {
      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: getResponsiveSpacing(theme.spacing.xs),
    },
    gridDot: {
      width: DEVICE_INFO.isTablet ? 6 : 4,
      height: DEVICE_INFO.isTablet ? 6 : 4,
      borderRadius: DEVICE_INFO.isTablet ? 3 : 2,
      backgroundColor: theme.colors.primary,
      marginHorizontal: getResponsiveSpacing(theme.spacing.sm),
    },
    gridText: {
      ...textStyles.caption,
      fontSize: getFontSize(DEVICE_INFO.isTablet ? 14 : 12),
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  const handleSettingsPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSettingsPress?.();
  };

  const handleCalendarPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCalendarPress?.();
  };

  return (
    <View style={styles.container}>
      {/* Main header content */}
      <View style={styles.headerContent}>
        {/* Left icon (Settings in LTR, Calendar in RTL) */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={isRTL ? handleCalendarPress : handleSettingsPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isRTL ? 'calendar' : 'settings'}
            size={RESPONSIVE_VALUES.iconSize}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>

        {/* Center content */}
        <View style={styles.centerContent}>
          {/* App title with gradient */}
          <LinearGradient
            colors={[theme.colors.task.teal, theme.colors.task.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.appTitle}>{t('app.title')}</Text>
          </LinearGradient>

          {/* Current date */}
          <Text style={styles.dateText}>
            {state.language === 'ar' 
              ? (state.useArabicNumerals 
                  ? convertToArabicNumerals(formatArabicDateShort(currentDate))
                  : formatArabicDateShort(currentDate))
              : currentDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })
            }
          </Text>
        </View>

        {/* Right icon (Calendar in LTR, Settings in RTL) */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={isRTL ? handleSettingsPress : handleCalendarPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isRTL ? 'settings' : 'calendar'}
            size={RESPONSIVE_VALUES.iconSize}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Grid indicator */}
      <View style={styles.gridIndicator}>
        <View style={styles.gridDot} />
        <Text style={styles.gridText}>
          {state.useArabicNumerals && state.language === 'ar' 
            ? convertToArabicNumerals(t('app.gridIndicator'))
            : t('app.gridIndicator')
          }
        </Text>
        <View style={styles.gridDot} />
      </View>
    </View>
  );
}

