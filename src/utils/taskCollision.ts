import { Task } from '../types';

/**
 * Result of collision detection
 */
export interface CollisionResult {
  /** Whether there is a collision */
  hasCollision: boolean;
  /** Tasks that are colliding */
  collidingTasks: Task[];
  /** Collision details */
  details: CollisionDetail[];
}

/**
 * Details about a specific collision
 */
export interface CollisionDetail {
  /** Task causing the collision */
  task: Task;
  /** Type of collision */
  type: 'overlap' | 'adjacent';
  /** Overlapping time slots */
  overlapSlots: number[];
}

/**
 * Check if two tasks have overlapping time slots
 * @param task1 - First task
 * @param task2 - Second task
 * @returns Whether the tasks overlap
 */
export function tasksOverlap(task1: Task, task2: Task): boolean {
  const task1End = task1.startSlot + task1.duration;
  const task2End = task2.startSlot + task2.duration;
  
  // Check if they don't overlap (easier to check the negative case)
  return !(task1End <= task2.startSlot || task2End <= task1.startSlot);
}

/**
 * Get the overlapping slots between two tasks
 * @param task1 - First task
 * @param task2 - Second task
 * @returns Array of overlapping slot numbers
 */
export function getOverlappingSlots(task1: Task, task2: Task): number[] {
  if (!tasksOverlap(task1, task2)) {
    return [];
  }
  
  const overlapStart = Math.max(task1.startSlot, task2.startSlot);
  const overlapEnd = Math.min(
    task1.startSlot + task1.duration,
    task2.startSlot + task2.duration
  );
  
  const overlappingSlots: number[] = [];
  for (let slot = overlapStart; slot < overlapEnd; slot++) {
    overlappingSlots.push(slot);
  }
  
  return overlappingSlots;
}

/**
 * Check if a new task would collide with existing tasks
 * @param newTask - Task to check
 * @param existingTasks - Array of existing tasks
 * @param excludeTaskId - Optional ID of task to exclude from collision check
 * @returns Collision detection result
 */
export function detectTaskCollision(
  newTask: Task,
  existingTasks: Task[],
  excludeTaskId?: number
): CollisionResult {
  const relevantTasks = excludeTaskId
    ? existingTasks.filter(task => task.id !== excludeTaskId)
    : existingTasks;
  
  const collidingTasks: Task[] = [];
  const details: CollisionDetail[] = [];
  
  for (const existingTask of relevantTasks) {
    if (tasksOverlap(newTask, existingTask)) {
      collidingTasks.push(existingTask);
      
      const overlapSlots = getOverlappingSlots(newTask, existingTask);
      details.push({
        task: existingTask,
        type: 'overlap',
        overlapSlots,
      });
    }
  }
  
  return {
    hasCollision: collidingTasks.length > 0,
    collidingTasks,
    details,
  };
}

/**
 * Find all collisions in a set of tasks
 * @param tasks - Array of tasks to check
 * @returns Array of collision pairs
 */
export function findAllCollisions(tasks: Task[]): Array<{
  task1: Task;
  task2: Task;
  overlapSlots: number[];
}> {
  const collisions: Array<{
    task1: Task;
    task2: Task;
    overlapSlots: number[];
  }> = [];
  
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const task1 = tasks[i];
      const task2 = tasks[j];
      
      if (tasksOverlap(task1, task2)) {
        const overlapSlots = getOverlappingSlots(task1, task2);
        collisions.push({
          task1,
          task2,
          overlapSlots,
        });
      }
    }
  }
  
  return collisions;
}

/**
 * Get available time slots for a given duration
 * @param duration - Required duration in slots
 * @param existingTasks - Array of existing tasks
 * @param startHour - Earliest start hour (default: 0)
 * @param endHour - Latest end hour (default: 24)
 * @returns Array of available start slots
 */
export function getAvailableSlots(
  duration: number,
  existingTasks: Task[],
  startHour: number = 0,
  endHour: number = 24
): number[] {
  const availableSlots: number[] = [];
  
  for (let slot = startHour; slot <= endHour - duration; slot++) {
    const testTask: Task = {
      id: -1, // Temporary ID for testing
      name: 'test',
      startSlot: slot,
      duration,
      completed: false,
      color: '#000000',
    };
    
    const collision = detectTaskCollision(testTask, existingTasks);
    if (!collision.hasCollision) {
      availableSlots.push(slot);
    }
  }
  
  return availableSlots;
}

/**
 * Suggest optimal time slots based on preferences
 * @param duration - Required duration in slots
 * @param existingTasks - Array of existing tasks
 * @param preferences - Preferred time ranges
 * @returns Array of suggested slots ordered by preference
 */
export function suggestOptimalSlots(
  duration: number,
  existingTasks: Task[],
  preferences: Array<{ start: number; end: number; weight: number }> = []
): Array<{ slot: number; score: number }> {
  const availableSlots = getAvailableSlots(duration, existingTasks);
  
  if (preferences.length === 0) {
    // Default preferences: morning (8-12) and afternoon (14-18)
    preferences = [
      { start: 8, end: 12, weight: 1.0 },
      { start: 14, end: 18, weight: 0.8 },
    ];
  }
  
  const scoredSlots = availableSlots.map(slot => {
    let score = 0.5; // Base score
    
    // Calculate score based on preferences
    for (const pref of preferences) {
      const slotEnd = slot + duration;
      const overlapStart = Math.max(slot, pref.start);
      const overlapEnd = Math.min(slotEnd, pref.end);
      
      if (overlapStart < overlapEnd) {
        const overlapDuration = overlapEnd - overlapStart;
        const overlapRatio = overlapDuration / duration;
        score += overlapRatio * pref.weight;
      }
    }
    
    return { slot, score };
  });
  
  // Sort by score (descending)
  return scoredSlots.sort((a, b) => b.score - a.score);
}

/**
 * Check if a task fits within business hours
 * @param task - Task to check
 * @param businessHours - Business hours range
 * @returns Whether the task fits within business hours
 */
export function isWithinBusinessHours(
  task: Task,
  businessHours: { start: number; end: number } = { start: 9, end: 17 }
): boolean {
  const taskEnd = task.startSlot + task.duration;
  return task.startSlot >= businessHours.start && taskEnd <= businessHours.end;
}

/**
 * Calculate total scheduled time for a day
 * @param tasks - Array of tasks
 * @returns Total scheduled hours
 */
export function calculateTotalScheduledTime(tasks: Task[]): number {
  return tasks.reduce((total, task) => total + task.duration, 0);
}

/**
 * Get schedule density for different time periods
 * @param tasks - Array of tasks
 * @returns Object with density metrics
 */
export function getScheduleDensity(tasks: Task[]): {
  morning: number; // 6-12
  afternoon: number; // 12-18
  evening: number; // 18-24
  night: number; // 0-6
  overall: number;
} {
  const periods = {
    morning: { start: 6, end: 12, scheduled: 0 },
    afternoon: { start: 12, end: 18, scheduled: 0 },
    evening: { start: 18, end: 24, scheduled: 0 },
    night: { start: 0, end: 6, scheduled: 0 },
  };
  
  for (const task of tasks) {
    const taskEnd = task.startSlot + task.duration;
    
    for (const [periodName, period] of Object.entries(periods)) {
      const overlapStart = Math.max(task.startSlot, period.start);
      const overlapEnd = Math.min(taskEnd, period.end);
      
      if (overlapStart < overlapEnd) {
        period.scheduled += overlapEnd - overlapStart;
      }
    }
  }
  
  return {
    morning: periods.morning.scheduled / 6, // 6 hours in morning
    afternoon: periods.afternoon.scheduled / 6, // 6 hours in afternoon
    evening: periods.evening.scheduled / 6, // 6 hours in evening
    night: periods.night.scheduled / 6, // 6 hours in night
    overall: calculateTotalScheduledTime(tasks) / 24, // 24 hours total
  };
}