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
import { COLORS, LAYOUT } from '../constants';
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
  const currentDate = new Date();
  const isRTL = I18nManager.isRTL;

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
            color={COLORS.text}
          />
        </TouchableOpacity>

        {/* Center content */}
        <View style={styles.centerContent}>
          {/* App title with gradient */}
          <LinearGradient
            colors={['#4ECDC4', '#45B7D1']} // Teal to Blue gradient
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
            color={COLORS.text}
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingTop: Platform.OS === 'ios' ? 50 : 35, // Safe area handling
    paddingHorizontal: LAYOUT.padding,
    paddingBottom: LAYOUT.padding,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.margin,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: LAYOUT.padding,
  },
  titleGradient: {
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding / 2,
    borderRadius: LAYOUT.borderRadius * 1.5,
    marginBottom: 4,
  },
  appTitle: {
    fontSize: Math.min(24, screenWidth * 0.06), // Responsive font size
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  dateText: {
    fontSize: Math.min(14, screenWidth * 0.035), // Responsive font size
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  gridIndicator: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: LAYOUT.margin / 2,
  },
  gridDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginHorizontal: LAYOUT.margin,
  },
  gridText: {
    fontSize: Math.min(12, screenWidth * 0.03), // Responsive font size
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});