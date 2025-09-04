import { useState, useCallback, useMemo } from 'react';
import { Task } from '../types';

/**
 * Time slot representing a single hour in the grid
 */
export interface TimeSlot {
  /** Hour (0-23) */
  hour: number;
  /** Whether this slot is occupied by a task */
  isOccupied: boolean;
  /** Task occupying this slot (if any) */
  task?: Task;
  /** Display label for the slot */
  label: string;
}

/**
 * Custom hook for managing time grid calculations and operations
 * @returns Object with time grid functions and data
 */
export function useTimeGrid() {
  const [selectedInterval, setSelectedInterval] = useState(60); // Default to 60 minutes
  
  /**
   * Generate time slots for a 24-hour period
   * @param tasks - Array of tasks to populate the grid
   * @returns Array of TimeSlot objects
   */
  const generateTimeSlots = useCallback((tasks: Task[]): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const occupyingTask = tasks.find(task => 
        hour >= task.startSlot && hour < task.startSlot + task.duration
      );
      
      slots.push({
        hour,
        isOccupied: !!occupyingTask,
        task: occupyingTask,
        label: formatTimeSlot(hour),
      });
    }
    
    return slots;
  }, []);

  /**
   * Format hour number to readable time string
   * @param hour - Hour (0-23)
   * @returns Formatted time string
   */
  const formatTimeSlot = useCallback((hour: number): string => {
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${displayHour}:00 ${ampm}`;
  }, []);

  /**
   * Check if a time range is available for scheduling
   * @param startSlot - Starting hour (0-23)
   * @param duration - Duration in hours
   * @param tasks - Current tasks to check against
   * @param excludeTaskId - Optional task ID to exclude from collision check
   * @returns Whether the time slot is available
   */
  const isTimeSlotAvailable = useCallback((
    startSlot: number, 
    duration: number, 
    tasks: Task[], 
    excludeTaskId?: number
  ): boolean => {
    // Check bounds
    if (startSlot < 0 || startSlot >= 24 || duration <= 0) {
      return false;
    }
    
    if (startSlot + duration > 24) {
      return false;
    }
    
    // Check for conflicts with existing tasks
    const relevantTasks = excludeTaskId 
      ? tasks.filter(task => task.id !== excludeTaskId)
      : tasks;
    
    for (const task of relevantTasks) {
      const taskEnd = task.startSlot + task.duration;
      const newTaskEnd = startSlot + duration;
      
      // Check for overlap
      if (!(taskEnd <= startSlot || task.startSlot >= newTaskEnd)) {
        return false;
      }
    }
    
    return true;
  }, []);

  /**
   * Find the next available time slot that can fit the given duration
   * @param duration - Required duration in hours
   * @param tasks - Current tasks
   * @param startFrom - Hour to start searching from (default: 0)
   * @returns Next available start slot or -1 if none found
   */
  const findNextAvailableSlot = useCallback((
    duration: number, 
    tasks: Task[], 
    startFrom: number = 0
  ): number => {
    for (let slot = startFrom; slot <= 24 - duration; slot++) {
      if (isTimeSlotAvailable(slot, duration, tasks)) {
        return slot;
      }
    }
    return -1;
  }, [isTimeSlotAvailable]);

  /**
   * Get suggested time slots for a task duration
   * @param duration - Required duration in hours
   * @param tasks - Current tasks
   * @param maxSuggestions - Maximum number of suggestions to return
   * @returns Array of suggested start slots
   */
  const getSuggestedSlots = useCallback((
    duration: number, 
    tasks: Task[], 
    maxSuggestions: number = 5
  ): number[] => {
    const suggestions: number[] = [];
    let currentSlot = 0;
    
    while (suggestions.length < maxSuggestions && currentSlot <= 24 - duration) {
      const availableSlot = findNextAvailableSlot(duration, tasks, currentSlot);
      if (availableSlot === -1) break;
      
      suggestions.push(availableSlot);
      currentSlot = availableSlot + 1;
    }
    
    return suggestions;
  }, [findNextAvailableSlot]);

  /**
   * Calculate grid statistics
   * @param tasks - Current tasks
   * @returns Object with grid statistics
   */
  const getGridStats = useCallback((tasks: Task[]) => {
    const totalSlots = 24;
    const occupiedSlots = tasks.reduce((sum, task) => sum + task.duration, 0);
    const freeSlots = totalSlots - occupiedSlots;
    const utilizationPercentage = (occupiedSlots / totalSlots) * 100;
    
    return {
      totalSlots,
      occupiedSlots,
      freeSlots,
      utilizationPercentage,
      taskCount: tasks.length,
    };
  }, []);

  /**
   * Convert minutes to hours for slot calculations
   * @param minutes - Number of minutes
   * @returns Number of hours (rounded up to nearest hour)
   */
  const minutesToSlots = useCallback((minutes: number): number => {
    return Math.ceil(minutes / 60);
  }, []);

  /**
   * Convert slots to minutes
   * @param slots - Number of hour slots
   * @returns Number of minutes
   */
  const slotsToMinutes = useCallback((slots: number): number => {
    return slots * 60;
  }, []);

  return {
    selectedInterval,
    setSelectedInterval,
    generateTimeSlots,
    formatTimeSlot,
    isTimeSlotAvailable,
    findNextAvailableSlot,
    getSuggestedSlots,
    getGridStats,
    minutesToSlots,
    slotsToMinutes,
  };
}