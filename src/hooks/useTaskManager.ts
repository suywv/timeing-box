import { useState, useCallback, useEffect } from 'react';
import { Task } from '../types';
import { useAsyncStorage } from './useAsyncStorage';
import { detectTaskCollision, getAvailableSlots } from '../utils/taskCollision';

const TASKS_STORAGE_KEY = 'time_jewel_tasks';
const DELETED_TASKS_STORAGE_KEY = 'time_jewel_deleted_tasks';

interface DeletedTask {
  task: Task;
  deletedAt: number;
}

/**
 * Comprehensive task management hook with CRUD operations and persistence
 */
export function useTaskManager() {
  const { value: tasks, updateValue: setTasks, loading: tasksLoading } = useAsyncStorage<Task[]>(TASKS_STORAGE_KEY, []);
  const { value: deletedTasks, updateValue: setDeletedTasks } = useAsyncStorage<DeletedTask[]>(DELETED_TASKS_STORAGE_KEY, []);
  
  const [loading, setLoading] = useState(false);

  /**
   * Add a new task
   */
  const addTask = useCallback(async (taskData: Omit<Task, 'id'>): Promise<{ success: boolean; task?: Task; error?: string }> => {
    setLoading(true);
    try {
      // Check for collision
      const tempTask: Task = {
        ...taskData,
        id: Date.now(),
      };
      
      const collision = detectTaskCollision(tempTask, tasks);
      if (collision.hasCollision) {
        return {
          success: false,
          error: `Task conflicts with: ${collision.collidingTasks.map(t => t.name).join(', ')}`,
        };
      }

      const newTask: Task = tempTask;
      const updatedTasks = [...tasks, newTask];
      await setTasks(updatedTasks);
      
      return { success: true, task: newTask };
    } catch (error) {
      return { success: false, error: 'Failed to add task' };
    } finally {
      setLoading(false);
    }
  }, [tasks, setTasks]);

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (id: number, updates: Partial<Omit<Task, 'id'>>): Promise<{ success: boolean; task?: Task; error?: string }> => {
    setLoading(true);
    try {
      const currentTask = tasks.find(t => t.id === id);
      if (!currentTask) {
        return { success: false, error: 'Task not found' };
      }

      const updatedTask = { ...currentTask, ...updates };
      
      // Check for collision if position/duration changed
      if (updates.startSlot !== undefined || updates.duration !== undefined) {
        const collision = detectTaskCollision(updatedTask, tasks, id);
        if (collision.hasCollision) {
          return {
            success: false,
            error: `Task would conflict with: ${collision.collidingTasks.map(t => t.name).join(', ')}`,
          };
        }
      }

      const updatedTasks = tasks.map(task => task.id === id ? updatedTask : task);
      await setTasks(updatedTasks);
      
      return { success: true, task: updatedTask };
    } catch (error) {
      return { success: false, error: 'Failed to update task' };
    } finally {
      setLoading(false);
    }
  }, [tasks, setTasks]);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const taskToDelete = tasks.find(t => t.id === id);
      if (!taskToDelete) {
        return { success: false, error: 'Task not found' };
      }

      // Store for undo functionality
      const deletedTask: DeletedTask = {
        task: taskToDelete,
        deletedAt: Date.now(),
      };
      
      const updatedDeletedTasks = [...deletedTasks, deletedTask];
      await setDeletedTasks(updatedDeletedTasks);

      const updatedTasks = tasks.filter(task => task.id !== id);
      await setTasks(updatedTasks);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete task' };
    } finally {
      setLoading(false);
    }
  }, [tasks, deletedTasks, setTasks, setDeletedTasks]);

  /**
   * Undo the last deletion
   */
  const undoDelete = useCallback(async (): Promise<{ success: boolean; task?: Task; error?: string }> => {
    if (deletedTasks.length === 0) {
      return { success: false, error: 'No tasks to restore' };
    }

    setLoading(true);
    try {
      const lastDeleted = deletedTasks[deletedTasks.length - 1];
      
      // Check if task can be restored (no collision)
      const collision = detectTaskCollision(lastDeleted.task, tasks);
      if (collision.hasCollision) {
        return {
          success: false,
          error: `Cannot restore - conflicts with: ${collision.collidingTasks.map(t => t.name).join(', ')}`,
        };
      }

      // Restore task
      const updatedTasks = [...tasks, lastDeleted.task];
      await setTasks(updatedTasks);

      // Remove from deleted tasks
      const updatedDeletedTasks = deletedTasks.slice(0, -1);
      await setDeletedTasks(updatedDeletedTasks);
      
      return { success: true, task: lastDeleted.task };
    } catch (error) {
      return { success: false, error: 'Failed to restore task' };
    } finally {
      setLoading(false);
    }
  }, [tasks, deletedTasks, setTasks, setDeletedTasks]);

  /**
   * Move task to a new time slot
   */
  const moveTask = useCallback(async (id: number, newStartSlot: number): Promise<{ success: boolean; error?: string }> => {
    const result = await updateTask(id, { startSlot: newStartSlot });
    return { success: result.success, error: result.error };
  }, [updateTask]);

  /**
   * Adjust task duration
   */
  const adjustDuration = useCallback(async (id: number, newDuration: number): Promise<{ success: boolean; error?: string }> => {
    if (newDuration < 1 || newDuration > 24) {
      return { success: false, error: 'Duration must be between 1 and 24 hours' };
    }

    const result = await updateTask(id, { duration: newDuration });
    return { success: result.success, error: result.error };
  }, [updateTask]);

  /**
   * Toggle task completion
   */
  const toggleCompletion = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) {
      return { success: false, error: 'Task not found' };
    }

    const result = await updateTask(id, { completed: !currentTask.completed });
    return { success: result.success, error: result.error };
  }, [tasks, updateTask]);

  /**
   * Move task left (earlier time)
   */
  const moveTaskLeft = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) {
      return { success: false, error: 'Task not found' };
    }

    if (currentTask.startSlot <= 0) {
      return { success: false, error: 'Cannot move earlier than 00:00' };
    }

    return moveTask(id, currentTask.startSlot - 1);
  }, [tasks, moveTask]);

  /**
   * Move task right (later time)
   */
  const moveTaskRight = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) {
      return { success: false, error: 'Task not found' };
    }

    if (currentTask.startSlot + currentTask.duration >= 24) {
      return { success: false, error: 'Cannot move beyond 23:00' };
    }

    return moveTask(id, currentTask.startSlot + 1);
  }, [tasks, moveTask]);

  /**
   * Increase task duration
   */
  const increaseDuration = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) {
      return { success: false, error: 'Task not found' };
    }

    return adjustDuration(id, currentTask.duration + 1);
  }, [tasks, adjustDuration]);

  /**
   * Decrease task duration
   */
  const decreaseDuration = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) {
      return { success: false, error: 'Task not found' };
    }

    if (currentTask.duration <= 1) {
      return { success: false, error: 'Task duration cannot be less than 1 hour' };
    }

    return adjustDuration(id, currentTask.duration - 1);
  }, [tasks, adjustDuration]);

  /**
   * Get available time slots for a duration
   */
  const getAvailableTimeSlots = useCallback((duration: number, excludeTaskId?: number): number[] => {
    const relevantTasks = excludeTaskId ? tasks.filter(t => t.id !== excludeTaskId) : tasks;
    return getAvailableSlots(duration, relevantTasks);
  }, [tasks]);

  /**
   * Check if undo is possible
   */
  const canUndo = deletedTasks.length > 0;

  /**
   * Clean old deleted tasks (older than 24 hours)
   */
  useEffect(() => {
    const cleanOldDeleted = async () => {
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      const recentDeleted = deletedTasks.filter(
        deleted => (now - deleted.deletedAt) < oneDayMs
      );
      
      if (recentDeleted.length !== deletedTasks.length) {
        await setDeletedTasks(recentDeleted);
      }
    };

    cleanOldDeleted();
  }, [deletedTasks, setDeletedTasks]);

  return {
    // Data
    tasks,
    loading: loading || tasksLoading,
    canUndo,

    // CRUD operations
    addTask,
    updateTask,
    deleteTask,
    undoDelete,

    // Task manipulation
    moveTask,
    moveTaskLeft,
    moveTaskRight,
    adjustDuration,
    increaseDuration,
    decreaseDuration,
    toggleCompletion,

    // Utilities
    getAvailableTimeSlots,
  };
}