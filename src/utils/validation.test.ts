import {
  validateTask,
  validateUser,
  validateAppState,
  sanitizeTask,
  sanitizeUser,
  isValidHexColor,
  isValidTimeSlot,
  isValidDuration,
  isTask,
  isUser,
  isAppState,
  ValidationResult,
  ValidationError,
} from './validation';
import { Task, User, AppState } from '../types';

describe('validation utils', () => {
  describe('validateTask', () => {
    const validTask: Task = {
      id: 1,
      name: 'Test Task',
      startSlot: 9,
      duration: 2,
      completed: false,
      color: '#FF0000',
    };

    it('should validate a complete valid task', () => {
      const result = validateTask(validTask);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require task name', () => {
      const task = { ...validTask };
      delete (task as any).name;
      
      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          code: 'REQUIRED_FIELD',
        })
      );
    });

    it('should validate task name type', () => {
      const task = { ...validTask, name: 123 as any };
      
      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          code: 'INVALID_TYPE',
        })
      );
    });

    it('should reject empty task name', () => {
      const task = { ...validTask, name: '   ' };
      
      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          code: 'EMPTY_FIELD',
        })
      );
    });

    it('should reject task name longer than 100 characters', () => {
      const task = { ...validTask, name: 'a'.repeat(101) };
      
      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          code: 'FIELD_TOO_LONG',
        })
      );
    });

    it('should validate startSlot range', () => {
      const invalidSlots = [-1, 24, 25];
      
      invalidSlots.forEach(slot => {
        const task = { ...validTask, startSlot: slot };
        const result = validateTask(task);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'startSlot',
            code: 'OUT_OF_RANGE',
          })
        );
      });
    });

    it('should validate duration range', () => {
      const invalidDurations = [0, -1, 25];
      
      invalidDurations.forEach(duration => {
        const task = { ...validTask, duration };
        const result = validateTask(task);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'duration',
            code: 'OUT_OF_RANGE',
          })
        );
      });
    });

    it('should reject task extending beyond 24 hours', () => {
      const task = { ...validTask, startSlot: 20, duration: 5 };
      
      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'duration',
          code: 'TIME_OVERFLOW',
        })
      );
    });

    it('should validate hex color format', () => {
      const invalidColors = ['red', '#GG0000', '#12345', '#1234567'];
      
      invalidColors.forEach(color => {
        const task = { ...validTask, color };
        const result = validateTask(task);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'color',
            code: 'INVALID_FORMAT',
          })
        );
      });
    });

    it('should accept valid hex colors', () => {
      const validColors = ['#FF0000', '#00ff00', '#123', '#ABC'];
      
      validColors.forEach(color => {
        const task = { ...validTask, color };
        const result = validateTask(task);
        expect(result.isValid).toBe(true);
      });
    });

    it('should validate ID as positive integer', () => {
      const invalidIds = [0, -1, 1.5, '1' as any];
      
      invalidIds.forEach(id => {
        const task = { ...validTask, id };
        const result = validateTask(task);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'id',
            code: 'INVALID_ID',
          })
        );
      });
    });
  });

  describe('validateUser', () => {
    const validUser: User = {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
    };

    it('should validate a complete valid user', () => {
      const result = validateUser(validUser);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require user fields', () => {
      const requiredFields = ['id', 'name', 'email'];
      
      requiredFields.forEach(field => {
        const user = { ...validUser };
        delete (user as any)[field];
        
        const result = validateUser(user);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field,
            code: 'REQUIRED_FIELD',
          })
        );
      });
    });

    it('should validate email format', () => {
      const invalidEmails = ['invalid', '@domain.com', 'test@', 'test@domain', 'test.domain.com'];
      
      invalidEmails.forEach(email => {
        const user = { ...validUser, email };
        const result = validateUser(user);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'email',
            code: 'INVALID_FORMAT',
          })
        );
      });
    });

    it('should reject user name longer than 50 characters', () => {
      const user = { ...validUser, name: 'a'.repeat(51) };
      
      const result = validateUser(user);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          code: 'FIELD_TOO_LONG',
        })
      );
    });
  });

  describe('validateAppState', () => {
    const validAppState: Partial<AppState> = {
      tasks: [],
      isRecording: false,
      selectedInterval: 60,
      currentTime: new Date(),
      isLoading: false,
      language: 'en',
    };

    it('should validate a valid app state', () => {
      const result = validateAppState(validAppState);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate tasks array', () => {
      const state = { ...validAppState, tasks: 'not-array' as any };
      
      const result = validateAppState(state);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'tasks',
          code: 'INVALID_TYPE',
        })
      );
    });

    it('should validate individual tasks in array', () => {
      const invalidTask = { name: 'test' }; // Missing required fields
      const state = { ...validAppState, tasks: [invalidTask] };
      
      const result = validateAppState(state);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field.startsWith('tasks[0].'))).toBe(true);
    });

    it('should validate language values', () => {
      const invalidLanguages = ['fr', 'es', 'de', 123];
      
      invalidLanguages.forEach(language => {
        const state = { ...validAppState, language: language as any };
        const result = validateAppState(state);
        expect(result.isValid).toBe(false);
      });
    });

    it('should accept valid language values', () => {
      const validLanguages = ['en', 'ar'];
      
      validLanguages.forEach(language => {
        const state = { ...validAppState, language };
        const result = validateAppState(state);
        expect(result.isValid).toBe(true);
      });
    });

    it('should validate currentTime as Date', () => {
      const invalidDates = ['2023-01-01', 123, new Date('invalid')];
      
      invalidDates.forEach(currentTime => {
        const state = { ...validAppState, currentTime: currentTime as any };
        const result = validateAppState(state);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('sanitizeTask', () => {
    it('should sanitize task properties', () => {
      const dirtyTask = {
        id: 1.5, // Should be ignored (not integer)
        name: '  Test Task  ', // Should be trimmed
        startSlot: -5, // Should be clamped to 0
        duration: 30, // Should be clamped to 24
        completed: true,
        color: '#ff0000', // Should be uppercased
      };

      const sanitized = sanitizeTask(dirtyTask);
      
      expect(sanitized).toEqual({
        name: 'Test Task',
        startSlot: 0,
        duration: 24,
        completed: true,
        color: '#FF0000',
      });
      expect(sanitized.id).toBeUndefined();
    });

    it('should handle very long names', () => {
      const task = { name: 'a'.repeat(200) };
      const sanitized = sanitizeTask(task);
      
      expect(sanitized.name).toHaveLength(100);
    });

    it('should reject invalid colors', () => {
      const task = { color: 'red' };
      const sanitized = sanitizeTask(task);
      
      expect(sanitized.color).toBeUndefined();
    });
  });

  describe('sanitizeUser', () => {
    it('should sanitize user properties', () => {
      const dirtyUser = {
        id: '  user123  ',
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
      };

      const sanitized = sanitizeUser(dirtyUser);
      
      expect(sanitized).toEqual({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should handle very long names', () => {
      const user = { name: 'a'.repeat(100) };
      const sanitized = sanitizeUser(user);
      
      expect(sanitized.name).toHaveLength(50);
    });
  });

  describe('utility validators', () => {
    describe('isValidHexColor', () => {
      it('should validate hex colors', () => {
        const validColors = ['#FF0000', '#00ff00', '#123', '#ABC'];
        const invalidColors = ['red', '#GG0000', '#12345', '#1234567', null, 123];
        
        validColors.forEach(color => {
          expect(isValidHexColor(color)).toBe(true);
        });
        
        invalidColors.forEach(color => {
          expect(isValidHexColor(color)).toBe(false);
        });
      });
    });

    describe('isValidTimeSlot', () => {
      it('should validate time slots', () => {
        const validSlots = [0, 12, 23];
        const invalidSlots = [-1, 24, 1.5, '12', null];
        
        validSlots.forEach(slot => {
          expect(isValidTimeSlot(slot)).toBe(true);
        });
        
        invalidSlots.forEach(slot => {
          expect(isValidTimeSlot(slot)).toBe(false);
        });
      });
    });

    describe('isValidDuration', () => {
      it('should validate durations', () => {
        const validDurations = [1, 12, 24];
        const invalidDurations = [0, -1, 25, 1.5, '12', null];
        
        validDurations.forEach(duration => {
          expect(isValidDuration(duration)).toBe(true);
        });
        
        invalidDurations.forEach(duration => {
          expect(isValidDuration(duration)).toBe(false);
        });
      });
    });
  });

  describe('type guards', () => {
    const validTask: Task = {
      id: 1,
      name: 'Test',
      startSlot: 9,
      duration: 2,
      completed: false,
      color: '#FF0000',
    };

    const validUser: User = {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
    };

    describe('isTask', () => {
      it('should identify valid tasks', () => {
        expect(isTask(validTask)).toBe(true);
      });

      it('should reject invalid tasks', () => {
        expect(isTask({})).toBe(false);
        expect(isTask(null)).toBe(false);
        expect(isTask('task')).toBe(false);
      });
    });

    describe('isUser', () => {
      it('should identify valid users', () => {
        expect(isUser(validUser)).toBe(true);
      });

      it('should reject invalid users', () => {
        expect(isUser({})).toBe(false);
        expect(isUser(null)).toBe(false);
        expect(isUser('user')).toBe(false);
      });
    });

    describe('isAppState', () => {
      it('should identify valid app states', () => {
        const validState = { tasks: [], isLoading: false };
        expect(isAppState(validState)).toBe(true);
      });

      it('should reject invalid app states', () => {
        expect(isAppState({ tasks: 'invalid' })).toBe(false);
        expect(isAppState(null)).toBe(false);
        expect(isAppState('state')).toBe(false);
      });
    });
  });
});