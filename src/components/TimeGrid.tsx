import React, { useMemo, useCallback } from 'react';
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
import TaskBlock from './TaskBlock';
import { useTranslation } from '../hooks/useTranslation';
import { useAppContext } from '../context/AppContext';
import { convertToArabicNumerals } from '../utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TimeGridProps {
  tasks?: Task[];
  onCellPress?: (hour: number) => void;
  onCellLongPress?: (hour: number) => void;
  onTaskPress?: (task: Task) => void;
  onTaskLongPress?: (task: Task) => void;
  selectedTaskId?: number | null;
  onMoveLeft?: (taskId: number) => void;
  onMoveRight?: (taskId: number) => void;
  onIncreaseDuration?: (taskId: number) => void;
  onDecreaseDuration?: (taskId: number) => void;
  onToggleComplete?: (taskId: number) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: number) => void;
}

const TimeGrid = React.memo<TimeGridProps>(({ 
  tasks = [], 
  onCellPress, 
  onCellLongPress,
  onTaskPress,
  onTaskLongPress,
  selectedTaskId,
  onMoveLeft,
  onMoveRight,
  onIncreaseDuration,
  onDecreaseDuration,
  onToggleComplete,
  onEditTask,
  onDeleteTask
}) => {
  const { generateTimeSlots, formatTimeSlot } = useTimeGrid();
  const { state } = useAppContext();
  const { isRTL } = useTranslation();
  
  const timeSlots = useMemo(() => generateTimeSlots(tasks), [tasks, generateTimeSlots]);
  
  // Generate unique task blocks (avoid duplicates for multi-hour tasks)
  const taskBlocks = useMemo(() => {
    const uniqueTasks = new Map<number, Task>();
    
    tasks.forEach(task => {
      // Only store the task once using its ID as the key
      if (!uniqueTasks.has(task.id)) {
        uniqueTasks.set(task.id, task);
      }
    });
    
    return Array.from(uniqueTasks.values());
  }, [tasks]);
  
  // Calculate responsive cell dimensions
  const gridPadding = LAYOUT.padding * 2;
  const gridSpacing = 4;
  const availableWidth = screenWidth - gridPadding;
  const cellWidth = Math.max(70, (availableWidth - (gridSpacing * 3)) / 4);
  const cellHeight = Math.max(70, cellWidth * 0.8);
  
  const handleCellPress = useCallback(async (hour: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCellPress?.(hour);
  }, [onCellPress]);
  
  const handleCellLongPress = useCallback(async (hour: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCellLongPress?.(hour);
  }, [onCellLongPress]);
  
  const renderCell = useCallback((timeSlot: typeof timeSlots[0], index: number) => {
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
          // Remove task-specific styling since TaskBlock handles visual representation
        ]}
        onPress={() => handleCellPress(timeSlot.hour)}
        onLongPress={() => handleCellLongPress(timeSlot.hour)}
        activeOpacity={0.8}
      >
        <Text style={styles.hourText}>
          {state.useArabicNumerals && state.language === 'ar' 
            ? convertToArabicNumerals(`${timeSlot.hour.toString().padStart(2, '0')}:00`)
            : `${timeSlot.hour.toString().padStart(2, '0')}:00`
          }
        </Text>
      </TouchableOpacity>
    );
  }, [cellWidth, cellHeight, gridSpacing, state.useArabicNumerals, state.language, handleCellPress, handleCellLongPress]);
  
  const renderTaskBlock = useCallback((task: Task) => {
    // Calculate task position
    const startRow = Math.floor(task.startSlot / 4);
    const startCol = task.startSlot % 4;
    
    return (
      <TaskBlock
        key={`task-${task.id}`}
        task={task}
        cellWidth={cellWidth}
        cellHeight={cellHeight}
        gridSpacing={gridSpacing}
        startRow={startRow}
        startCol={startCol}
        onTaskPress={onTaskPress}
        onTaskLongPress={onTaskLongPress}
        showActions={selectedTaskId === task.id}
        onMoveLeft={() => onMoveLeft?.(task.id)}
        onMoveRight={() => onMoveRight?.(task.id)}
        onIncreaseDuration={() => onIncreaseDuration?.(task.id)}
        onDecreaseDuration={() => onDecreaseDuration?.(task.id)}
        onToggleComplete={() => onToggleComplete?.(task.id)}
        onEdit={() => onEditTask?.(task)}
        onDelete={() => onDeleteTask?.(task.id)}
      />
    );
  }, [cellWidth, cellHeight, gridSpacing, selectedTaskId, onTaskPress, onTaskLongPress, onMoveLeft, onMoveRight, onIncreaseDuration, onDecreaseDuration, onToggleComplete, onEditTask, onDeleteTask]);
  
  // Calculate total grid height - memoize expensive calculations
  const gridDimensions = useMemo(() => ({
    height: 6 * (cellHeight + gridSpacing) - gridSpacing,
    width: 4 * (cellWidth + gridSpacing) - gridSpacing
  }), [cellHeight, cellWidth, gridSpacing]);
  
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      scrollEventThrottle={16}
      removeClippedSubviews={true}
      bounces={false}
    >
      <View style={[
        styles.grid,
        {
          width: gridDimensions.width,
          height: gridDimensions.height,
        }
      ]}>
        {/* Render empty grid cells */}
        {timeSlots.map((timeSlot, index) => renderCell(timeSlot, index))}
        
        {/* Render task blocks as overlays */}
        {taskBlocks.map(task => renderTaskBlock(task))}
      </View>
    </ScrollView>
  );
});

TimeGrid.displayName = 'TimeGrid';

export default TimeGrid;

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
  hourText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});