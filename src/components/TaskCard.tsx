import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { COLORS, LAYOUT } from '../constants';
import { Task } from '../types';
import TaskActions from './TaskActions';

interface TaskCardProps {
  task: Task;
  showActions?: boolean;
  onPress?: (task: Task) => void;
  onLongPress?: (task: Task) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onIncreaseDuration?: () => void;
  onDecreaseDuration?: () => void;
  onToggleComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TaskCard({
  task,
  showActions = false,
  onPress,
  onLongPress,
  onMoveLeft,
  onMoveRight,
  onIncreaseDuration,
  onDecreaseDuration,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const taskOpacity = task.completed ? 0.7 : 1.0;
  const textColor = task.completed ? COLORS.textSecondary : COLORS.text;
  
  const startTime = `${task.startSlot.toString().padStart(2, '0')}:00`;
  const endTime = `${(task.startSlot + task.duration).toString().padStart(2, '0')}:00`;
  const timeDisplay = `${startTime} - ${endTime}`;
  const durationText = `${task.duration} ${task.duration === 1 ? 'hour' : 'hours'}`;

  const handlePress = () => {
    onPress?.(task);
  };

  const handleLongPress = () => {
    onLongPress?.(task);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, taskOpacity],
          }),
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: task.color }]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <View style={[styles.colorIndicator, { backgroundColor: task.color }]} />
              <Text
                style={[styles.taskName, { color: textColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {task.name}
                {task.completed && ' ✓'}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, task.completed ? styles.completedBadge : styles.pendingBadge]}>
                <Text style={styles.statusText}>
                  {task.completed ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.taskDetails}>
            <Text style={[styles.timeText, { color: textColor }]}>
              🕐 {timeDisplay}
            </Text>
            <Text style={[styles.durationText, { color: textColor }]}>
              ⏱️ {durationText}
            </Text>
          </View>

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
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: LAYOUT.margin / 2,
    marginHorizontal: LAYOUT.margin,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    padding: LAYOUT.padding,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: LAYOUT.margin,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: LAYOUT.margin / 2,
    marginLeft: I18nManager.isRTL ? LAYOUT.margin / 2 : 0,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  statusContainer: {
    marginLeft: LAYOUT.margin,
    marginRight: I18nManager.isRTL ? LAYOUT.margin : 0,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: '#E8F5E8',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.margin,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: I18nManager.isRTL ? 'left' : 'right',
  },
  actionsContainer: {
    marginTop: LAYOUT.margin,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: LAYOUT.margin,
  },
});