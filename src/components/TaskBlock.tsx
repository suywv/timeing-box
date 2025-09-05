import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  I18nManager,
  TouchableOpacity,
} from 'react-native';
import { COLORS, LAYOUT } from '../constants';
import { Task } from '../types';
import TaskActions from './TaskActions';
import { useTranslation } from '../hooks/useTranslation';
import { useAppContext } from '../context/AppContext';
import { convertToArabicNumerals } from '../utils';

interface TaskBlockProps {
  task: Task;
  cellWidth: number;
  cellHeight: number;
  gridSpacing: number;
  startRow: number;
  startCol: number;
  onTaskPress?: (task: Task) => void;
  onTaskLongPress?: (task: Task) => void;
  showActions?: boolean;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onIncreaseDuration?: () => void;
  onDecreaseDuration?: () => void;
  onToggleComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TaskBlock = React.memo<TaskBlockProps>(({
  task,
  cellWidth,
  cellHeight,
  gridSpacing,
  startRow,
  startCol,
  onTaskPress,
  onTaskLongPress,
  showActions = false,
  onMoveLeft,
  onMoveRight,
  onIncreaseDuration,
  onDecreaseDuration,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const { state } = useAppContext();
  const { isRTL } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  // Memoize expensive calculations
  const taskDimensions = useMemo(() => ({
    width: task.duration * cellWidth + (task.duration - 1) * gridSpacing,
    height: cellHeight,
  }), [task.duration, cellWidth, cellHeight, gridSpacing]);

  // Handle RTL layout - memoized
  const taskPosition = useMemo(() => {
    const isRTLLayout = I18nManager.isRTL;
    const adjustedStartCol = isRTLLayout ? 3 - startCol - (task.duration - 1) : startCol;
    
    return {
      left: adjustedStartCol * (cellWidth + gridSpacing),
      top: startRow * (cellHeight + gridSpacing),
    };
  }, [startRow, startCol, task.duration, cellWidth, cellHeight, gridSpacing]);
  
  // Determine border radius for start and end cells
  const borderRadius = {
    borderTopLeftRadius: LAYOUT.borderRadius,
    borderBottomLeftRadius: LAYOUT.borderRadius,
    borderTopRightRadius: LAYOUT.borderRadius,
    borderBottomRightRadius: LAYOUT.borderRadius,
  };
  
  // Adjust border radius for RTL
  if (isRTL) {
    borderRadius.borderTopLeftRadius = LAYOUT.borderRadius;
    borderRadius.borderBottomLeftRadius = LAYOUT.borderRadius;
    borderRadius.borderTopRightRadius = LAYOUT.borderRadius;
    borderRadius.borderBottomRightRadius = LAYOUT.borderRadius;
  }

  // Determine if this is the first cell (where we show text)
  const isFirstCell = true; // We'll only render text in the first cell

  // Calculate text styling based on task state
  const taskOpacity = task.completed ? 0.6 : 1.0;
  const textColor = task.completed ? COLORS.text : '#FFFFFF';

  // Memoize time display calculation
  const timeDisplay = useMemo(() => {
    const startTime = `${task.startSlot.toString().padStart(2, '0')}:00`;
    const endTime = `${(task.startSlot + task.duration).toString().padStart(2, '0')}:00`;
    return `${startTime}-${endTime}`;
  }, [task.startSlot, task.duration]);

  const handlePress = useCallback(() => {
    onTaskPress?.(task);
  }, [onTaskPress, task]);

  const handleLongPress = useCallback(() => {
    onTaskLongPress?.(task);
  }, [onTaskLongPress, task]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      style={[
        styles.taskBlockContainer,
        {
          width: taskDimensions.width,
          height: taskDimensions.height,
          left: taskPosition.left,
          top: taskPosition.top,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.taskBlock,
          borderRadius,
          {
            width: '100%',
            height: '100%',
            backgroundColor: task.color,
            opacity: opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, taskOpacity],
            }),
            transform: [
              {
                scale: scaleAnim,
              },
            ],
          },
        ]}
      >
      {isFirstCell && (
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text style={[styles.taskName, { color: textColor }]} numberOfLines={1}>
              {task.name}
              {task.completed && ' 💎'}
            </Text>
          </View>
          <Text style={[styles.taskTime, { color: textColor }]} numberOfLines={1}>
            {timeDisplay}
          </Text>
          {showActions && onMoveLeft && onMoveRight && onIncreaseDuration && onDecreaseDuration && onToggleComplete && onEdit && onDelete && (
            <View style={styles.actionsContainer}>
              <TaskActions
                task={task}
                onMoveLeft={onMoveLeft}
                onMoveRight={onMoveRight}
                onIncreaseDuration={onIncreaseDuration}
                onDecreaseDuration={onDecreaseDuration}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </View>
          )}
        </View>
      )}
      </Animated.View>
    </TouchableOpacity>
  );
});

TaskBlock.displayName = 'TaskBlock';

export default TaskBlock;

const styles = StyleSheet.create({
  taskBlockContainer: {
    position: 'absolute',
  },
  taskBlock: {
    borderRadius: LAYOUT.borderRadius,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  taskContent: {
    flex: 1,
    justifyContent: 'center',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  taskTime: {
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  actionsContainer: {
    marginTop: 8,
  },
});