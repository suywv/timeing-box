import { useState, useCallback } from 'react';
import { Task } from '../types';

/**
 * Custom hook for managing task CRUD operations
 * @returns Object with task management functions
 */
export function useTaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Add a new task
   * @param task - Task to add (without id, will be generated)
   * @returns Promise resolving to the created task
   */
  const addTask = useCallback(async (taskData: Omit<Task, 'id'>): Promise<Task> => {
    setLoading(true);
    try {
      const newTask: Task = {
        ...taskData,
        id: Date.now(), // Simple ID generation
      };
      
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing task
   * @param id - Task ID to update
   * @param updates - Partial task data to update
   * @returns Promise resolving to updated task or null if not found
   */
  const updateTask = useCallback(async (id: number, updates: Partial<Omit<Task, 'id'>>): Promise<Task | null> => {
    setLoading(true);
    try {
      let updatedTask: Task | null = null;
      
      setTasks(prev => prev.map(task => {
        if (task.id === id) {
          updatedTask = { ...task, ...updates };
          return updatedTask;
        }
        return task;
      }));
      
      return updatedTask;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a task by ID
   * @param id - Task ID to delete
   * @returns Promise resolving to boolean indicating success
   */
  const deleteTask = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      let found = false;
      setTasks(prev => {
        const filtered = prev.filter(task => {
          if (task.id === id) {
            found = true;
            return false;
          }
          return true;
        });
        return filtered;
      });
      
      return found;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get a task by ID
   * @param id - Task ID to find
   * @returns Task or null if not found
   */
  const getTask = useCallback((id: number): Task | null => {
    return tasks.find(task => task.id === id) || null;
  }, [tasks]);

  /**
   * Get all tasks
   * @returns Array of all tasks
   */
  const getAllTasks = useCallback((): Task[] => {
    return [...tasks];
  }, [tasks]);

  /**
   * Get tasks filtered by completion status
   * @param completed - Filter by completion status
   * @returns Filtered array of tasks
   */
  const getTasksByStatus = useCallback((completed: boolean): Task[] => {
    return tasks.filter(task => task.completed === completed);
  }, [tasks]);

  /**
   * Clear all tasks
   * @returns Promise resolving when all tasks are cleared
   */
  const clearAllTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    getTask,
    getAllTasks,
    getTasksByStatus,
    clearAllTasks,
  };
}