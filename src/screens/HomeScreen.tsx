import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { APP_NAME, COLORS, LAYOUT } from '../constants';
import TimeGrid from '../components/TimeGrid';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import { Task } from '../types';
import { useTaskManager } from '../hooks/useTaskManager';

export default function HomeScreen() {
  const {
    tasks,
    loading,
    canUndo,
    addTask,
    updateTask,
    deleteTask,
    undoDelete,
    moveTaskLeft,
    moveTaskRight,
    increaseDuration,
    decreaseDuration,
    toggleCompletion,
    getAvailableTimeSlots,
  } = useTaskManager();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Initialize with sample tasks if none exist
  useEffect(() => {
    if (tasks.length === 0) {
      const initializeData = async () => {
        const sampleTasks = [
          {
            name: 'Morning Workout Session',
            startSlot: 6,
            duration: 2,
            completed: false,
            color: '#FF6B6B',
          },
          {
            name: 'Work Meeting',
            startSlot: 9,
            duration: 1,
            completed: false,
            color: '#4ECDC4',
          },
          {
            name: 'Lunch Break',
            startSlot: 12,
            duration: 1,
            completed: true,
            color: '#45B7D1',
          },
        ];

        for (const taskData of sampleTasks) {
          await addTask(taskData);
        }
      };

      initializeData();
    }
  }, [tasks.length, addTask]);

  const handleCellPress = (hour: number) => {
    const availableSlots = getAvailableTimeSlots(1);
    if (availableSlots.includes(hour)) {
      setAddModalVisible(true);
    } else {
      Alert.alert('Time Slot Occupied', `${hour}:00 is already occupied by a task`);
    }
  };

  const handleCellLongPress = (hour: number) => {
    setAddModalVisible(true);
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTaskId(selectedTaskId === task.id ? null : task.id);
  };

  const handleTaskLongPress = (task: Task) => {
    setEditingTask(task);
    setEditModalVisible(true);
  };

  // Task action handlers
  const handleMoveLeft = async (taskId: number) => {
    const result = await moveTaskLeft(taskId);
    if (!result.success && result.error) {
      Alert.alert('Cannot Move', result.error);
    }
  };

  const handleMoveRight = async (taskId: number) => {
    const result = await moveTaskRight(taskId);
    if (!result.success && result.error) {
      Alert.alert('Cannot Move', result.error);
    }
  };

  const handleIncreaseDuration = async (taskId: number) => {
    const result = await increaseDuration(taskId);
    if (!result.success && result.error) {
      Alert.alert('Cannot Increase Duration', result.error);
    }
  };

  const handleDecreaseDuration = async (taskId: number) => {
    const result = await decreaseDuration(taskId);
    if (!result.success && result.error) {
      Alert.alert('Cannot Decrease Duration', result.error);
    }
  };

  const handleToggleComplete = async (taskId: number) => {
    const result = await toggleCompletion(taskId);
    if (!result.success && result.error) {
      Alert.alert('Error', result.error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditModalVisible(true);
    setSelectedTaskId(null);
  };

  const handleDeleteTask = async (taskId: number) => {
    const result = await deleteTask(taskId);
    if (result.success) {
      setSelectedTaskId(null);
      // Show undo option
      setTimeout(() => {
        Alert.alert(
          'Task Deleted',
          'Task has been deleted.',
          [
            { text: 'OK' },
            {
              text: 'Undo',
              onPress: async () => {
                const undoResult = await undoDelete();
                if (!undoResult.success && undoResult.error) {
                  Alert.alert('Cannot Undo', undoResult.error);
                }
              },
            },
          ]
        );
      }, 100);
    } else if (result.error) {
      Alert.alert('Error', result.error);
    }
  };

  const handleUndoDelete = async () => {
    const result = await undoDelete();
    if (result.success) {
      Alert.alert('Restored', `"${result.task?.name}" has been restored`);
    } else if (result.error) {
      Alert.alert('Cannot Undo', result.error);
    }
  };

  return (
    <ActionSheetProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>Tap empty cells to add tasks</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddModalVisible(true)}
            >
              <Text style={styles.addButtonText}>+ Add Task</Text>
            </TouchableOpacity>
            
            {canUndo && (
              <TouchableOpacity
                style={styles.undoButton}
                onPress={handleUndoDelete}
              >
                <Text style={styles.undoButtonText}>↺ Undo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TimeGrid 
          tasks={tasks}
          onCellPress={handleCellPress}
          onCellLongPress={handleCellLongPress}
          onTaskPress={handleTaskPress}
          onTaskLongPress={handleTaskLongPress}
          selectedTaskId={selectedTaskId}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onIncreaseDuration={handleIncreaseDuration}
          onDecreaseDuration={handleDecreaseDuration}
          onToggleComplete={handleToggleComplete}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />

        <AddTaskModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onAddTask={addTask}
          availableSlots={getAvailableTimeSlots(1)}
        />

        <EditTaskModal
          visible={editModalVisible}
          task={editingTask}
          onClose={() => {
            setEditModalVisible(false);
            setEditingTask(null);
          }}
          onUpdateTask={updateTask}
          availableSlots={getAvailableTimeSlots(1, editingTask?.id)}
        />
      </View>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: LAYOUT.padding,
    paddingBottom: LAYOUT.padding,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: LAYOUT.margin / 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.padding,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding / 2,
    borderRadius: LAYOUT.borderRadius,
    marginRight: LAYOUT.margin,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  undoButton: {
    backgroundColor: COLORS.textSecondary,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    borderRadius: LAYOUT.borderRadius,
  },
  undoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});