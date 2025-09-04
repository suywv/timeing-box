import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  I18nManager,
  ListRenderItem,
} from 'react-native';
import { COLORS, LAYOUT } from '../constants';
import { Task } from '../types';
import TaskCard from './TaskCard';

interface TaskSummaryPanelProps {
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  onTaskLongPress?: (task: Task) => void;
  onMoveLeft?: (taskId: number) => void;
  onMoveRight?: (taskId: number) => void;
  onIncreaseDuration?: (taskId: number) => void;
  onDecreaseDuration?: (taskId: number) => void;
  onToggleComplete?: (taskId: number) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: number) => void;
  onRefresh?: () => Promise<void>;
  selectedTaskId?: number | null;
  style?: any;
}

export default function TaskSummaryPanel({
  tasks,
  onTaskPress,
  onTaskLongPress,
  onMoveLeft,
  onMoveRight,
  onIncreaseDuration,
  onDecreaseDuration,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onRefresh,
  selectedTaskId = null,
  style,
}: TaskSummaryPanelProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error refreshing tasks:', error);
      } finally {
        setRefreshing(false);
      }
    }
  }, [onRefresh]);

  const handleTaskPress = (task: Task) => {
    onTaskPress?.(task);
  };

  const handleTaskLongPress = (task: Task) => {
    onTaskLongPress?.(task);
  };

  const createTaskActionHandler = (taskId: number, action: ((id: number) => void) | undefined) => {
    return action ? () => action(taskId) : undefined;
  };

  const renderTask: ListRenderItem<Task> = ({ item: task, index }) => {
    const isSelected = selectedTaskId === task.id;
    const showActions = isSelected && !task.completed;

    return (
      <TaskCard
        task={task}
        showActions={showActions}
        onPress={handleTaskPress}
        onLongPress={handleTaskLongPress}
        onMoveLeft={createTaskActionHandler(task.id, onMoveLeft)}
        onMoveRight={createTaskActionHandler(task.id, onMoveRight)}
        onIncreaseDuration={createTaskActionHandler(task.id, onIncreaseDuration)}
        onDecreaseDuration={createTaskActionHandler(task.id, onDecreaseDuration)}
        onToggleComplete={createTaskActionHandler(task.id, onToggleComplete)}
        onEdit={onEditTask ? () => onEditTask(task) : undefined}
        onDelete={createTaskActionHandler(task.id, onDeleteTask)}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Animated.View style={styles.emptyContent}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyTitle}>No Tasks Available</Text>
        <Text style={styles.emptyMessage}>
          {I18nManager.isRTL 
            ? 'لا توجد مهام لعرضها. ابدأ بإضافة مهمة جديدة!'
            : 'No tasks to display. Start by adding a new task!'
          }
        </Text>
      </Animated.View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {I18nManager.isRTL ? 'ملخص المهام اليومية' : 'Daily Task Summary'}
      </Text>
      <Text style={styles.headerSubtitle}>
        {tasks.length === 0 
          ? (I18nManager.isRTL ? 'لا توجد مهام' : 'No tasks')
          : I18nManager.isRTL 
            ? `${tasks.length} مهمة`
            : `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`
        }
      </Text>
    </View>
  );

  const keyExtractor = (item: Task) => `task-${item.id}`;

  const getItemLayout = (_: any, index: number) => ({
    length: 120, // Estimated height of each TaskCard
    offset: 120 * index,
    index,
  });

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={[
          styles.listContent,
          tasks.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title={I18nManager.isRTL ? 'تحديث المهام...' : 'Refreshing tasks...'}
            titleColor={COLORS.textSecondary}
          />
        }
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: LAYOUT.padding,
  },
  emptyListContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: LAYOUT.margin,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 4,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: LAYOUT.padding,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: LAYOUT.margin,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});