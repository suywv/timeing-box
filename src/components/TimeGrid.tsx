import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  I18nManager,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, LAYOUT } from '../constants';
import { useTimeGrid } from '../hooks/useTimeGrid';
import { Task } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TimeGridProps {
  tasks?: Task[];
  onCellPress?: (hour: number) => void;
  onCellLongPress?: (hour: number) => void;
}

export default function TimeGrid({ 
  tasks = [], 
  onCellPress, 
  onCellLongPress 
}: TimeGridProps) {
  const { generateTimeSlots, formatTimeSlot } = useTimeGrid();
  
  const timeSlots = useMemo(() => generateTimeSlots(tasks), [tasks, generateTimeSlots]);
  
  // Calculate responsive cell dimensions
  const gridPadding = LAYOUT.padding * 2;
  const gridSpacing = 4;
  const availableWidth = screenWidth - gridPadding;
  const cellWidth = Math.max(70, (availableWidth - (gridSpacing * 3)) / 4);
  const cellHeight = Math.max(70, cellWidth * 0.8);
  
  const handleCellPress = async (hour: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCellPress?.(hour);
  };
  
  const handleCellLongPress = async (hour: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCellLongPress?.(hour);
  };
  
  const renderCell = (timeSlot: typeof timeSlots[0], index: number) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    
    // For RTL support, reverse column order
    const adjustedCol = I18nManager.isRTL ? 3 - col : col;
    
    return (
      <TouchableOpacity
        key={timeSlot.hour}
        style={[
          styles.cell,
          {
            width: cellWidth,
            height: cellHeight,
            left: adjustedCol * (cellWidth + gridSpacing),
            top: row * (cellHeight + gridSpacing),
          },
          timeSlot.isOccupied && styles.occupiedCell,
          timeSlot.task && { backgroundColor: timeSlot.task.color + '40' }, // Add transparency
        ]}
        onPress={() => handleCellPress(timeSlot.hour)}
        onLongPress={() => handleCellLongPress(timeSlot.hour)}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.hourText,
          timeSlot.isOccupied && styles.occupiedText
        ]}>
          {timeSlot.hour.toString().padStart(2, '0')}:00
        </Text>
        {timeSlot.task && (
          <Text style={styles.taskName} numberOfLines={1}>
            {timeSlot.task.name}
          </Text>
        )}
      </TouchableOpacity>
    );
  };
  
  // Calculate total grid height
  const gridHeight = 6 * (cellHeight + gridSpacing) - gridSpacing;
  const gridWidth = 4 * (cellWidth + gridSpacing) - gridSpacing;
  
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[
        styles.grid,
        {
          width: gridWidth,
          height: gridHeight,
        }
      ]}>
        {timeSlots.map((timeSlot, index) => renderCell(timeSlot, index))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    position: 'relative',
  },
  cell: {
    position: 'absolute',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius,
    borderWidth: 1,
    borderColor: '#E5E5EA',
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
    padding: 4,
  },
  occupiedCell: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  hourText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  occupiedText: {
    color: COLORS.primary,
  },
  taskName: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});