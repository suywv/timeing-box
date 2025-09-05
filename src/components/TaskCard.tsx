import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { useThemeValues } from '../context/ThemeContext';
import { textStyles } from '../utils/styleUtils';
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
  const theme = useThemeValues();
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
  const textColor = task.completed ? theme.colors.text.secondary : theme.colors.text.primary;

  // Create dynamic styles using theme
  const styles = StyleSheet.create({
    container: {
      marginVertical: theme.spacing.xs,
      marginHorizontal: theme.spacing.sm,
    },
    card: {
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.layout.borderRadius.base,
      borderLeftWidth: 4,
      ...theme.layout.shadow.base,
      overflow: 'hidden',
    },
    cardContent: {
      padding: theme.spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
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
      marginRight: theme.spacing.xs,
      marginLeft: I18nManager.isRTL ? theme.spacing.xs : 0,
    },
    taskName: {
      ...textStyles.subtitle,
      fontSize: 16,
      flex: 1,
      textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    statusContainer: {
      marginLeft: theme.spacing.sm,
      marginRight: I18nManager.isRTL ? theme.spacing.sm : 0,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.layout.borderRadius.md,
      minWidth: 80,
      alignItems: 'center',
    },
    completedBadge: {
      backgroundColor: theme.colors.success + '20',
    },
    pendingBadge: {
      backgroundColor: theme.colors.warning + '20',
    },
    statusText: {
      ...textStyles.caption,
      fontWeight: '500',
      color: theme.colors.text.tertiary,
    },
    taskDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    timeText: {
      ...textStyles.body,
      fontWeight: '500',
      flex: 1,
      textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    durationText: {
      ...textStyles.body,
      fontWeight: '500',
      textAlign: I18nManager.isRTL ? 'left' : 'right',
    },
    actionsContainer: {
      marginTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      paddingTop: theme.spacing.sm,
    },
  });
  
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

