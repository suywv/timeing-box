import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { APP_NAME } from '../constants';
import { useThemeValues } from '../context/ThemeContext';
import { textStyles, createContainerStyle } from '../utils/styleUtils';
import { 
  getResponsiveSpacing,
  RESPONSIVE_VALUES,
  DEVICE_INFO,
  getSafeAreaPadding
} from '../utils/responsiveUtils';
import Header from '../components/Header';
import TimeGrid from '../components/TimeGrid';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import VoiceRecordingInterface from '../components/VoiceRecordingInterface';
import LanguageToggle from '../components/LanguageToggle';
import { Task } from '../types';
import { useTaskManager } from '../hooks/useTaskManager';

export default function HomeScreen() {
  const theme = useThemeValues();
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

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

  // Keyboard handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

  const handleSettingsPress = () => {
    Alert.alert('Settings', 'Settings functionality will be implemented soon');
  };

  const handleCalendarPress = () => {
    Alert.alert('Calendar', 'Calendar functionality will be implemented soon');
  };

  // Create dynamic styles using theme and responsive utilities
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: getResponsiveSpacing(theme.spacing.md),
      paddingTop: getResponsiveSpacing(theme.spacing.sm),
    },
    scrollContainer: {
      flex: 1,
    },
    subtitle: {
      ...textStyles.secondary,
      textAlign: 'center',
      marginBottom: getResponsiveSpacing(theme.spacing.md),
      fontSize: DEVICE_INFO.isTablet ? 16 : 14,
    },
    headerActions: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: getResponsiveSpacing(theme.spacing.sm),
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: getResponsiveSpacing(theme.spacing.lg),
      paddingVertical: getResponsiveSpacing(theme.spacing.sm),
      borderRadius: theme.layout.borderRadius.full,
      marginRight: getResponsiveSpacing(theme.spacing.sm),
      minHeight: RESPONSIVE_VALUES.buttonHeight,
      ...theme.layout.shadow.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonText: {
      ...textStyles.button,
      fontSize: DEVICE_INFO.isTablet ? 16 : theme.typography.size.base,
    },
    undoButton: {
      backgroundColor: theme.colors.text.secondary,
      paddingHorizontal: getResponsiveSpacing(theme.spacing.md),
      paddingVertical: getResponsiveSpacing(theme.spacing.sm),
      borderRadius: theme.layout.borderRadius.full,
      minHeight: RESPONSIVE_VALUES.buttonHeight,
      ...theme.layout.shadow.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    undoButtonText: {
      ...textStyles.button,
      fontSize: DEVICE_INFO.isTablet ? 14 : theme.typography.size.sm,
    },
  });

  return (
    <ActionSheetProvider>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <LinearGradient 
          colors={theme.colors.background.gradient}
          style={styles.container}
        >
          <Header 
            onSettingsPress={handleSettingsPress}
            onCalendarPress={handleCalendarPress}
          />
          
          {/* Language Toggle for testing */}
          <LanguageToggle />
          
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setScrollViewHeight(height);
            }}
          >
            <View style={styles.content}>
              <Text style={styles.subtitle}>انقر على الخلايا الفارغة لإضافة المهام</Text>
              
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setAddModalVisible(true)}
                  accessibilityLabel="Add new task"
                  accessibilityHint="Opens modal to create a new task"
                >
                  <Text style={styles.addButtonText}>+ إضافة مهمة</Text>
                </TouchableOpacity>
                
                {canUndo && (
                  <TouchableOpacity
                    style={styles.undoButton}
                    onPress={handleUndoDelete}
                    accessibilityLabel="Undo last deletion"
                    accessibilityHint="Restores the last deleted task"
                  >
                    <Text style={styles.undoButtonText}>↺ تراجع</Text>
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
          </ScrollView>

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

          <VoiceRecordingInterface
            onRecordingComplete={(uri) => {
              console.log('Recording completed with URI:', uri);
              // TODO: In the future, this could process the audio to extract task information
            }}
          />
        </LinearGradient>
      </KeyboardAvoidingView>
    </ActionSheetProvider>
  );
}

