import {
  tasksOverlap,
  getOverlappingSlots,
  detectTaskCollision,
  findAllCollisions,
  getAvailableSlots,
  suggestOptimalSlots,
  isWithinBusinessHours,
  calculateTotalScheduledTime,
  getScheduleDensity,
  CollisionResult,
  CollisionDetail,
} from './taskCollision';
import { Task } from '../types';

describe('taskCollision utils', () => {
  const createTask = (id: number, name: string, startSlot: number, duration: number): Task => ({
    id,
    name,
    startSlot,
    duration,
    completed: false,
    color: '#FF0000',
  });

  describe('tasksOverlap', () => {
    it('should detect overlapping tasks', () => {
      const task1 = createTask(1, 'Task 1', 9, 2); // 9-11
      const task2 = createTask(2, 'Task 2', 10, 2); // 10-12
      
      expect(tasksOverlap(task1, task2)).toBe(true);
      expect(tasksOverlap(task2, task1)).toBe(true);
    });

    it('should detect adjacent tasks as non-overlapping', () => {
      const task1 = createTask(1, 'Task 1', 9, 2); // 9-11
      const task2 = createTask(2, 'Task 2', 11, 2); // 11-13
      
      expect(tasksOverlap(task1, task2)).toBe(false);
      expect(tasksOverlap(task2, task1)).toBe(false);
    });

    it('should detect non-overlapping tasks with gap', () => {
      const task1 = createTask(1, 'Task 1', 9, 2); // 9-11
      const task2 = createTask(2, 'Task 2', 13, 2); // 13-15
      
      expect(tasksOverlap(task1, task2)).toBe(false);
      expect(tasksOverlap(task2, task1)).toBe(false);
    });

    it('should detect one task completely inside another', () => {
      const task1 = createTask(1, 'Task 1', 9, 6); // 9-15
      const task2 = createTask(2, 'Task 2', 11, 2); // 11-13
      
      expect(tasksOverlap(task1, task2)).toBe(true);
      expect(tasksOverlap(task2, task1)).toBe(true);
    });

    it('should handle identical tasks', () => {
      const task1 = createTask(1, 'Task 1', 9, 2);
      const task2 = createTask(2, 'Task 2', 9, 2);
      
      expect(tasksOverlap(task1, task2)).toBe(true);
    });
  });

  describe('getOverlappingSlots', () => {
    it('should return overlapping slots', () => {
      const task1 = createTask(1, 'Task 1', 9, 3); // 9-12
      const task2 = createTask(2, 'Task 2', 10, 3); // 10-13
      
      const overlappingSlots = getOverlappingSlots(task1, task2);
      expect(overlappingSlots).toEqual([10, 11]);
    });

    it('should return empty array for non-overlapping tasks', () => {
      const task1 = createTask(1, 'Task 1', 9, 2); // 9-11
      const task2 = createTask(2, 'Task 2', 11, 2); // 11-13
      
      const overlappingSlots = getOverlappingSlots(task1, task2);
      expect(overlappingSlots).toEqual([]);
    });

    it('should return all slots for identical tasks', () => {
      const task1 = createTask(1, 'Task 1', 9, 2); // 9-11
      const task2 = createTask(2, 'Task 2', 9, 2); // 9-11
      
      const overlappingSlots = getOverlappingSlots(task1, task2);
      expect(overlappingSlots).toEqual([9, 10]);
    });

    it('should handle one task inside another', () => {
      const task1 = createTask(1, 'Task 1', 8, 6); // 8-14
      const task2 = createTask(2, 'Task 2', 10, 2); // 10-12
      
      const overlappingSlots = getOverlappingSlots(task1, task2);
      expect(overlappingSlots).toEqual([10, 11]);
    });
  });

  describe('detectTaskCollision', () => {
    const existingTasks = [
      createTask(1, 'Morning Task', 9, 2), // 9-11
      createTask(2, 'Lunch Break', 12, 1), // 12-13
      createTask(3, 'Afternoon Task', 15, 3), // 15-18
    ];

    it('should detect collision with existing task', () => {
      const newTask = createTask(4, 'New Task', 10, 2); // 10-12
      
      const result = detectTaskCollision(newTask, existingTasks);
      expect(result.hasCollision).toBe(true);
      expect(result.collidingTasks).toHaveLength(1);
      expect(result.collidingTasks[0].id).toBe(1);
      expect(result.details[0].overlapSlots).toEqual([10]);
    });

    it('should detect no collision for available slot', () => {
      const newTask = createTask(4, 'New Task', 19, 2); // 19-21
      
      const result = detectTaskCollision(newTask, existingTasks);
      expect(result.hasCollision).toBe(false);
      expect(result.collidingTasks).toHaveLength(0);
    });

    it('should exclude specified task ID', () => {
      const newTask = createTask(1, 'Updated Task', 10, 2); // Same as existing task 1
      
      const result = detectTaskCollision(newTask, existingTasks, 1);
      expect(result.hasCollision).toBe(false);
    });

    it('should detect multiple collisions', () => {
      const newTask = createTask(4, 'Long Task', 11, 5); // 11-16, overlaps with tasks 2 and 3
      
      const result = detectTaskCollision(newTask, existingTasks);
      expect(result.hasCollision).toBe(true);
      expect(result.collidingTasks).toHaveLength(2);
      expect(result.collidingTasks.map(t => t.id).sort()).toEqual([2, 3]);
    });
  });

  describe('findAllCollisions', () => {
    it('should find all collision pairs', () => {
      const tasks = [
        createTask(1, 'Task 1', 9, 3), // 9-12
        createTask(2, 'Task 2', 11, 2), // 11-13, overlaps with 1
        createTask(3, 'Task 3', 12, 1), // 12-13, overlaps with 2
        createTask(4, 'Task 4', 15, 2), // 15-17, no overlap
      ];

      const collisions = findAllCollisions(tasks);
      expect(collisions).toHaveLength(2);
      
      // Check first collision (task1 and task2)
      expect(collisions[0].task1.id).toBe(1);
      expect(collisions[0].task2.id).toBe(2);
      expect(collisions[0].overlapSlots).toEqual([11]);
      
      // Check second collision (task2 and task3)
      expect(collisions[1].task1.id).toBe(2);
      expect(collisions[1].task2.id).toBe(3);
      expect(collisions[1].overlapSlots).toEqual([12]);
    });

    it('should return empty array for non-overlapping tasks', () => {
      const tasks = [
        createTask(1, 'Task 1', 9, 2), // 9-11
        createTask(2, 'Task 2', 12, 2), // 12-14
        createTask(3, 'Task 3', 15, 2), // 15-17
      ];

      const collisions = findAllCollisions(tasks);
      expect(collisions).toHaveLength(0);
    });
  });

  describe('getAvailableSlots', () => {
    const existingTasks = [
      createTask(1, 'Morning Task', 9, 2), // 9-11
      createTask(2, 'Afternoon Task', 15, 2), // 15-17
    ];

    it('should find available slots for given duration', () => {
      const availableSlots = getAvailableSlots(2, existingTasks);
      
      expect(availableSlots).toContain(0); // 0-2
      expect(availableSlots).toContain(7); // 7-9
      expect(availableSlots).toContain(11); // 11-13
      expect(availableSlots).toContain(13); // 13-15
      expect(availableSlots).toContain(17); // 17-19
      expect(availableSlots).toContain(22); // 22-24
      
      // Should not contain slots that would overlap
      expect(availableSlots).not.toContain(8); // 8-10 overlaps with 9-11
      expect(availableSlots).not.toContain(10); // 10-12 overlaps with 9-11
      expect(availableSlots).not.toContain(14); // 14-16 overlaps with 15-17
      expect(availableSlots).not.toContain(16); // 16-18 overlaps with 15-17
    });

    it('should respect start and end hour constraints', () => {
      const availableSlots = getAvailableSlots(2, existingTasks, 8, 20);
      
      expect(availableSlots).not.toContain(0);
      expect(availableSlots).not.toContain(19); // 19-21 would exceed endHour
      expect(availableSlots).toContain(11);
      expect(availableSlots).toContain(17);
    });

    it('should handle no available slots', () => {
      const fullDayTask = createTask(1, 'Full Day', 0, 24);
      const availableSlots = getAvailableSlots(1, [fullDayTask]);
      
      expect(availableSlots).toHaveLength(0);
    });
  });

  describe('suggestOptimalSlots', () => {
    const existingTasks = [
      createTask(1, 'Early Task', 6, 1), // 6-7
      createTask(2, 'Late Task', 20, 2), // 20-22
    ];

    it('should suggest slots with default preferences', () => {
      const suggestions = suggestOptimalSlots(2, existingTasks);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('slot');
      expect(suggestions[0]).toHaveProperty('score');
      
      // Slots in morning (8-12) and afternoon (14-18) should have higher scores
      const morningSlots = suggestions.filter(s => s.slot >= 8 && s.slot <= 10);
      const afternoonSlots = suggestions.filter(s => s.slot >= 14 && s.slot <= 16);
      const nightSlots = suggestions.filter(s => s.slot >= 0 && s.slot <= 5);
      
      if (morningSlots.length > 0 && nightSlots.length > 0) {
        expect(morningSlots[0].score).toBeGreaterThan(nightSlots[0].score);
      }
    });

    it('should use custom preferences', () => {
      const preferences = [{ start: 22, end: 24, weight: 1.0 }]; // Late night preference
      const suggestions = suggestOptimalSlots(2, existingTasks, preferences);
      
      const lateNightSlot = suggestions.find(s => s.slot === 22);
      const morningSlot = suggestions.find(s => s.slot === 8);
      
      if (lateNightSlot && morningSlot) {
        expect(lateNightSlot.score).toBeGreaterThan(morningSlot.score);
      }
    });

    it('should return empty array when no slots available', () => {
      const fullDayTask = createTask(1, 'Full Day', 0, 24);
      const suggestions = suggestOptimalSlots(1, [fullDayTask]);
      
      expect(suggestions).toHaveLength(0);
    });
  });

  describe('isWithinBusinessHours', () => {
    it('should check if task is within default business hours', () => {
      const businessTask = createTask(1, 'Business Task', 10, 4); // 10-14
      const earlyTask = createTask(2, 'Early Task', 7, 2); // 7-9
      const lateTask = createTask(3, 'Late Task', 18, 2); // 18-20
      
      expect(isWithinBusinessHours(businessTask)).toBe(true);
      expect(isWithinBusinessHours(earlyTask)).toBe(false);
      expect(isWithinBusinessHours(lateTask)).toBe(false);
    });

    it('should check if task is within custom business hours', () => {
      const task = createTask(1, 'Task', 8, 2); // 8-10
      const customHours = { start: 8, end: 18 };
      
      expect(isWithinBusinessHours(task, customHours)).toBe(true);
    });

    it('should handle edge cases', () => {
      const startTask = createTask(1, 'Start Task', 9, 1); // 9-10
      const endTask = createTask(2, 'End Task', 16, 1); // 16-17
      const overflowTask = createTask(3, 'Overflow Task', 16, 2); // 16-18
      
      expect(isWithinBusinessHours(startTask)).toBe(true);
      expect(isWithinBusinessHours(endTask)).toBe(true);
      expect(isWithinBusinessHours(overflowTask)).toBe(false);
    });
  });

  describe('calculateTotalScheduledTime', () => {
    it('should calculate total scheduled time', () => {
      const tasks = [
        createTask(1, 'Task 1', 9, 2), // 2 hours
        createTask(2, 'Task 2', 12, 3), // 3 hours
        createTask(3, 'Task 3', 16, 1), // 1 hour
      ];

      expect(calculateTotalScheduledTime(tasks)).toBe(6);
    });

    it('should handle empty task array', () => {
      expect(calculateTotalScheduledTime([])).toBe(0);
    });
  });

  describe('getScheduleDensity', () => {
    it('should calculate schedule density for different periods', () => {
      const tasks = [
        createTask(1, 'Morning Task', 8, 2), // 8-10 (morning)
        createTask(2, 'Lunch Task', 13, 1), // 13-14 (afternoon)
        createTask(3, 'Evening Task', 19, 2), // 19-21 (evening)
        createTask(4, 'Night Task', 2, 1), // 2-3 (night)
      ];

      const density = getScheduleDensity(tasks);

      expect(density.morning).toBeCloseTo(2/6); // 2 hours out of 6
      expect(density.afternoon).toBeCloseTo(1/6); // 1 hour out of 6
      expect(density.evening).toBeCloseTo(2/6); // 2 hours out of 6
      expect(density.night).toBeCloseTo(1/6); // 1 hour out of 6
      expect(density.overall).toBeCloseTo(6/24); // 6 hours out of 24
    });

    it('should handle tasks spanning multiple periods', () => {
      const tasks = [
        createTask(1, 'Long Task', 11, 4), // 11-15 (spans morning and afternoon)
      ];

      const density = getScheduleDensity(tasks);

      expect(density.morning).toBeCloseTo(1/6); // 1 hour (11-12) out of 6
      expect(density.afternoon).toBeCloseTo(3/6); // 3 hours (12-15) out of 6
      expect(density.evening).toBe(0);
      expect(density.night).toBe(0);
      expect(density.overall).toBeCloseTo(4/24);
    });

    it('should handle empty task array', () => {
      const density = getScheduleDensity([]);

      expect(density.morning).toBe(0);
      expect(density.afternoon).toBe(0);
      expect(density.evening).toBe(0);
      expect(density.night).toBe(0);
      expect(density.overall).toBe(0);
    });

    it('should handle tasks at period boundaries', () => {
      const tasks = [
        createTask(1, 'Boundary Task 1', 5, 2), // 5-7 (spans night and morning)
        createTask(2, 'Boundary Task 2', 11, 2), // 11-13 (spans morning and afternoon)
        createTask(3, 'Boundary Task 3', 17, 2), // 17-19 (spans afternoon and evening)
        createTask(4, 'Boundary Task 4', 23, 2), // 23-1 (spans evening and night)
      ];

      const density = getScheduleDensity(tasks);

      expect(density.morning).toBeCloseTo(2/6); // 6-7 and 11-12
      expect(density.afternoon).toBeCloseTo(2/6); // 12-13 and 17-18
      expect(density.evening).toBeCloseTo(2/6); // 18-19 and 23-24
      expect(density.night).toBeCloseTo(2/6); // 5-6 and 0-1
    });
  });
});