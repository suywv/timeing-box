import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { COLORS, LAYOUT } from '../constants';
import TaskSummaryPanel from '../components/TaskSummaryPanel';
import Header from '../components/Header';
import EditTaskModal from '../components/EditTaskModal';
import { Task } from '../types';
import { useTaskManager } from '../hooks/useTaskManager';

export default function TaskSummaryScreen() {
  const {
    tasks,
    loading,
    updateTask,
    deleteTask,
    moveTaskLeft,
    moveTaskRight,
    increaseDuration,
    decreaseDuration,
    toggleCompletion,
    getAvailableTimeSlots,
  } = useTaskManager();

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleTaskPress = (task: Task) => {
    setSelectedTaskId(selectedTaskId === task.id ? null : task.id);
  };

  const handleTaskLongPress = (task: Task) => {
    setEditingTask(task);
    setEditModalVisible(true);
  };

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
      Alert.alert('Task Deleted', 'Task has been deleted successfully.');
    } else if (result.error) {
      Alert.alert('Error', result.error);
    }
  };

  const handleRefresh = async () => {
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleSettingsPress = () => {
    Alert.alert('Settings', 'Settings functionality will be implemented soon');
  };

  const handleCalendarPress = () => {
    Alert.alert('Calendar', 'Calendar functionality will be implemented soon');
  };

  return (
    <ActionSheetProvider>
      <SafeAreaView style={styles.container}>
        <Header 
          onSettingsPress={handleSettingsPress}
          onCalendarPress={handleCalendarPress}
        />
        
        <TaskSummaryPanel
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onTaskPress={handleTaskPress}
          onTaskLongPress={handleTaskLongPress}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onIncreaseDuration={handleIncreaseDuration}
          onDecreaseDuration={handleDecreaseDuration}
          onToggleComplete={handleToggleComplete}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onRefresh={handleRefresh}
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
      </SafeAreaView>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});