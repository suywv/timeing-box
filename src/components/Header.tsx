import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  I18nManager,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeValues } from '../context/ThemeContext';
import { textStyles } from '../utils/styleUtils';
import { formatArabicDateShort } from '../utils';

const { width: screenWidth } = Dimensions.get('window');

interface HeaderProps {
  onSettingsPress?: () => void;
  onCalendarPress?: () => void;
}

export default function Header({
  onSettingsPress,
  onCalendarPress,
}: HeaderProps) {
  const theme = useThemeValues();
  const currentDate = new Date();
  const isRTL = I18nManager.isRTL;

  // Create dynamic styles using theme
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface.primary,
      paddingTop: Platform.OS === 'ios' ? 50 : 35,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      ...theme.layout.shadow.base,
    },
    headerContent: {
      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.layout.shadow.sm,
    },
    centerContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: theme.spacing.md,
    },
    titleGradient: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.layout.borderRadius.md,
      marginBottom: 4,
    },
    appTitle: {
      ...textStyles.title,
      fontSize: Math.min(24, screenWidth * 0.06),
      color: theme.colors.text.inverse,
      textAlign: 'center',
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    dateText: {
      ...textStyles.secondary,
      fontSize: Math.min(14, screenWidth * 0.035),
      textAlign: 'center',
      fontWeight: '500',
    },
    gridIndicator: {
      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: theme.spacing.xs,
    },
    gridDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
      marginHorizontal: theme.spacing.sm,
    },
    gridText: {
      ...textStyles.caption,
      fontSize: Math.min(12, screenWidth * 0.03),
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
            size={24}
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
            <Text style={styles.appTitle}>جوهرة الوقت</Text>
          </LinearGradient>

          {/* Current date in Arabic */}
          <Text style={styles.dateText}>
            {formatArabicDateShort(currentDate)}
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
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Grid indicator */}
      <View style={styles.gridIndicator}>
        <View style={styles.gridDot} />
        <Text style={styles.gridText}>شبكة 4×6 (24 ساعة)</Text>
        <View style={styles.gridDot} />
      </View>
    </View>
  );
}

