import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as Haptics from 'expo-haptics';
import { COLORS, LAYOUT } from '../constants';
import { Task } from '../types';

interface TaskActionsProps {
  task: Task;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onIncreaseDuration: () => void;
  onDecreaseDuration: () => void;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskActions = React.memo<TaskActionsProps>(({
  task,
  onMoveLeft,
  onMoveRight,
  onIncreaseDuration,
  onDecreaseDuration,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const { showActionSheetWithOptions } = useActionSheet();

  // Memoize action sheet options
  const actionSheetOptions = useMemo(() => {
    const options = [
      'Edit Task',
      'Move Earlier (←)',
      'Move Later (→)',
      'Increase Duration (+)',
      'Decrease Duration (-)',
      task.completed ? 'Mark Incomplete' : 'Mark Complete ✓',
      'Delete Task',
      'Cancel',
    ];

    return {
      options,
      destructiveButtonIndex: 6, // Delete Task
      cancelButtonIndex: 7,
      title: `Task: ${task.name}`,
      message: `${task.startSlot}:00 - ${task.startSlot + task.duration}:00 (${task.duration}h)`,
    };
  }, [task.completed, task.name, task.startSlot, task.duration]);

  const handleActionPress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    showActionSheetWithOptions(
      {
        ...actionSheetOptions,
        userInterfaceStyle: 'light',
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            onEdit();
            break;
          case 1:
            onMoveLeft();
            break;
          case 2:
            onMoveRight();
            break;
          case 3:
            onIncreaseDuration();
            break;
          case 4:
            onDecreaseDuration();
            break;
          case 5:
            onToggleComplete();
            break;
          case 6:
            confirmDelete();
            break;
        }
      }
    );
  }, [actionSheetOptions, showActionSheetWithOptions, onEdit, onMoveLeft, onMoveRight, onIncreaseDuration, onDecreaseDuration, onToggleComplete, onDelete]);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.name}"? This action can be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  }, [task.name, onDelete]);

  return (
    <View style={styles.container}>
      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.moveButton]}
          onPress={onMoveLeft}
          disabled={task.startSlot <= 0}
        >
          <Text style={[styles.buttonText, task.startSlot <= 0 && styles.disabledText]}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.moveButton]}
          onPress={onMoveRight}
          disabled={task.startSlot + task.duration >= 24}
        >
          <Text style={[styles.buttonText, (task.startSlot + task.duration >= 24) && styles.disabledText]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.durationButton]}
          onPress={onDecreaseDuration}
          disabled={task.duration <= 1}
        >
          <Text style={[styles.buttonText, task.duration <= 1 && styles.disabledText]}>-</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.durationButton]}
          onPress={onIncreaseDuration}
          disabled={task.startSlot + task.duration >= 24}
        >
          <Text style={[styles.buttonText, (task.startSlot + task.duration >= 24) && styles.disabledText]}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton, task.completed && styles.completedButton]}
          onPress={onToggleComplete}
        >
          <Text style={[styles.buttonText, task.completed && styles.completedText]}>
            {task.completed ? '✓' : '○'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={handleActionPress}
      >
        <Text style={styles.menuButtonText}>⋯</Text>
      </TouchableOpacity>
    </View>
  );
});

TaskActions.displayName = 'TaskActions';

export default TaskActions;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: LAYOUT.borderRadius,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  moveButton: {
    backgroundColor: COLORS.primary,
  },
  durationButton: {
    backgroundColor: COLORS.secondary,
  },
  completeButton: {
    backgroundColor: '#28A745',
  },
  completedButton: {
    backgroundColor: '#6C757D',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#CCCCCC',
  },
  completedText: {
    color: '#FFFFFF',
  },
  menuButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.textSecondary,
    borderRadius: LAYOUT.borderRadius,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});