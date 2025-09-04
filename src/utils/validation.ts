import { Task, User, AppState } from '../types';

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Create a validation error
 * @param field - Field name
 * @param message - Error message
 * @param code - Error code
 * @returns ValidationError object
 */
function createValidationError(field: string, message: string, code: string): ValidationError {
  return { field, message, code };
}

/**
 * Validate task data
 * @param task - Task object to validate
 * @param existingTasks - Existing tasks for collision checking
 * @returns Validation result
 */
export function validateTask(task: Partial<Task>, existingTasks: Task[] = []): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate ID
  if (task.id !== undefined) {
    if (!Number.isInteger(task.id) || task.id <= 0) {
      errors.push(createValidationError('id', 'ID must be a positive integer', 'INVALID_ID'));
    }
  }

  // Validate name
  if (task.name === undefined || task.name === null) {
    errors.push(createValidationError('name', 'Task name is required', 'REQUIRED_FIELD'));
  } else if (typeof task.name !== 'string') {
    errors.push(createValidationError('name', 'Task name must be a string', 'INVALID_TYPE'));
  } else if (task.name.trim().length === 0) {
    errors.push(createValidationError('name', 'Task name cannot be empty', 'EMPTY_FIELD'));
  } else if (task.name.length > 100) {
    errors.push(createValidationError('name', 'Task name must be 100 characters or less', 'FIELD_TOO_LONG'));
  }

  // Validate startSlot
  if (task.startSlot === undefined || task.startSlot === null) {
    errors.push(createValidationError('startSlot', 'Start slot is required', 'REQUIRED_FIELD'));
  } else if (!Number.isInteger(task.startSlot)) {
    errors.push(createValidationError('startSlot', 'Start slot must be an integer', 'INVALID_TYPE'));
  } else if (task.startSlot < 0 || task.startSlot >= 24) {
    errors.push(createValidationError('startSlot', 'Start slot must be between 0 and 23', 'OUT_OF_RANGE'));
  }

  // Validate duration
  if (task.duration === undefined || task.duration === null) {
    errors.push(createValidationError('duration', 'Duration is required', 'REQUIRED_FIELD'));
  } else if (!Number.isInteger(task.duration)) {
    errors.push(createValidationError('duration', 'Duration must be an integer', 'INVALID_TYPE'));
  } else if (task.duration <= 0) {
    errors.push(createValidationError('duration', 'Duration must be greater than 0', 'OUT_OF_RANGE'));
  } else if (task.duration > 24) {
    errors.push(createValidationError('duration', 'Duration cannot exceed 24 hours', 'OUT_OF_RANGE'));
  }

  // Validate that task doesn't exceed 24 hours
  if (
    typeof task.startSlot === 'number' &&
    typeof task.duration === 'number' &&
    task.startSlot + task.duration > 24
  ) {
    errors.push(createValidationError('duration', 'Task cannot extend beyond 24 hours', 'TIME_OVERFLOW'));
  }

  // Validate completed
  if (task.completed !== undefined && typeof task.completed !== 'boolean') {
    errors.push(createValidationError('completed', 'Completed must be a boolean', 'INVALID_TYPE'));
  }

  // Validate color
  if (task.color === undefined || task.color === null) {
    errors.push(createValidationError('color', 'Color is required', 'REQUIRED_FIELD'));
  } else if (typeof task.color !== 'string') {
    errors.push(createValidationError('color', 'Color must be a string', 'INVALID_TYPE'));
  } else if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(task.color)) {
    errors.push(createValidationError('color', 'Color must be a valid hex color (e.g., #FF0000)', 'INVALID_FORMAT'));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate user data
 * @param user - User object to validate
 * @returns Validation result
 */
export function validateUser(user: Partial<User>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate ID
  if (user.id === undefined || user.id === null) {
    errors.push(createValidationError('id', 'User ID is required', 'REQUIRED_FIELD'));
  } else if (typeof user.id !== 'string') {
    errors.push(createValidationError('id', 'User ID must be a string', 'INVALID_TYPE'));
  } else if (user.id.trim().length === 0) {
    errors.push(createValidationError('id', 'User ID cannot be empty', 'EMPTY_FIELD'));
  }

  // Validate name
  if (user.name === undefined || user.name === null) {
    errors.push(createValidationError('name', 'User name is required', 'REQUIRED_FIELD'));
  } else if (typeof user.name !== 'string') {
    errors.push(createValidationError('name', 'User name must be a string', 'INVALID_TYPE'));
  } else if (user.name.trim().length === 0) {
    errors.push(createValidationError('name', 'User name cannot be empty', 'EMPTY_FIELD'));
  } else if (user.name.length > 50) {
    errors.push(createValidationError('name', 'User name must be 50 characters or less', 'FIELD_TOO_LONG'));
  }

  // Validate email
  if (user.email === undefined || user.email === null) {
    errors.push(createValidationError('email', 'Email is required', 'REQUIRED_FIELD'));
  } else if (typeof user.email !== 'string') {
    errors.push(createValidationError('email', 'Email must be a string', 'INVALID_TYPE'));
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push(createValidationError('email', 'Email must be a valid email address', 'INVALID_FORMAT'));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate app state data
 * @param state - App state object to validate
 * @returns Validation result
 */
export function validateAppState(state: Partial<AppState>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate tasks
  if (state.tasks !== undefined) {
    if (!Array.isArray(state.tasks)) {
      errors.push(createValidationError('tasks', 'Tasks must be an array', 'INVALID_TYPE'));
    } else {
      state.tasks.forEach((task, index) => {
        const taskValidation = validateTask(task);
        if (!taskValidation.isValid) {
          taskValidation.errors.forEach(error => {
            errors.push({
              ...error,
              field: `tasks[${index}].${error.field}`,
            });
          });
        }
      });
    }
  }

  // Validate isRecording
  if (state.isRecording !== undefined && typeof state.isRecording !== 'boolean') {
    errors.push(createValidationError('isRecording', 'isRecording must be a boolean', 'INVALID_TYPE'));
  }

  // Validate selectedInterval
  if (state.selectedInterval !== undefined) {
    if (!Number.isInteger(state.selectedInterval)) {
      errors.push(createValidationError('selectedInterval', 'selectedInterval must be an integer', 'INVALID_TYPE'));
    } else if (state.selectedInterval <= 0) {
      errors.push(createValidationError('selectedInterval', 'selectedInterval must be greater than 0', 'OUT_OF_RANGE'));
    }
  }

  // Validate currentTime
  if (state.currentTime !== undefined) {
    if (!(state.currentTime instanceof Date)) {
      errors.push(createValidationError('currentTime', 'currentTime must be a Date object', 'INVALID_TYPE'));
    } else if (isNaN(state.currentTime.getTime())) {
      errors.push(createValidationError('currentTime', 'currentTime must be a valid Date', 'INVALID_DATE'));
    }
  }

  // Validate isLoading
  if (state.isLoading !== undefined && typeof state.isLoading !== 'boolean') {
    errors.push(createValidationError('isLoading', 'isLoading must be a boolean', 'INVALID_TYPE'));
  }

  // Validate user
  if (state.user !== undefined && state.user !== null) {
    const userValidation = validateUser(state.user);
    if (!userValidation.isValid) {
      userValidation.errors.forEach(error => {
        errors.push({
          ...error,
          field: `user.${error.field}`,
        });
      });
    }
  }

  // Validate language
  if (state.language !== undefined) {
    if (typeof state.language !== 'string') {
      errors.push(createValidationError('language', 'Language must be a string', 'INVALID_TYPE'));
    } else if (!['en', 'ar'].includes(state.language)) {
      errors.push(createValidationError('language', 'Language must be either "en" or "ar"', 'INVALID_VALUE'));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize task data by removing invalid fields and normalizing values
 * @param task - Task object to sanitize
 * @returns Sanitized task object
 */
export function sanitizeTask(task: Partial<Task>): Partial<Task> {
  const sanitized: Partial<Task> = {};

  if (typeof task.id === 'number' && Number.isInteger(task.id) && task.id > 0) {
    sanitized.id = task.id;
  }

  if (typeof task.name === 'string') {
    sanitized.name = task.name.trim().substring(0, 100);
  }

  if (typeof task.startSlot === 'number' && Number.isInteger(task.startSlot)) {
    sanitized.startSlot = Math.max(0, Math.min(23, task.startSlot));
  }

  if (typeof task.duration === 'number' && Number.isInteger(task.duration)) {
    sanitized.duration = Math.max(1, Math.min(24, task.duration));
  }

  if (typeof task.completed === 'boolean') {
    sanitized.completed = task.completed;
  }

  if (typeof task.color === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(task.color)) {
    sanitized.color = task.color.toUpperCase();
  }

  return sanitized;
}

/**
 * Sanitize user data
 * @param user - User object to sanitize
 * @returns Sanitized user object
 */
export function sanitizeUser(user: Partial<User>): Partial<User> {
  const sanitized: Partial<User> = {};

  if (typeof user.id === 'string') {
    sanitized.id = user.id.trim();
  }

  if (typeof user.name === 'string') {
    sanitized.name = user.name.trim().substring(0, 50);
  }

  if (typeof user.email === 'string') {
    sanitized.email = user.email.trim().toLowerCase();
  }

  return sanitized;
}

/**
 * Check if a value is a valid hex color
 * @param value - Value to check
 * @returns Whether the value is a valid hex color
 */
export function isValidHexColor(value: any): value is string {
  return typeof value === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

/**
 * Check if a value is a valid time slot (0-23)
 * @param value - Value to check
 * @returns Whether the value is a valid time slot
 */
export function isValidTimeSlot(value: any): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 23;
}

/**
 * Check if a value is a valid duration (1-24)
 * @param value - Value to check
 * @returns Whether the value is a valid duration
 */
export function isValidDuration(value: any): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 24;
}

/**
 * Type guard for Task interface
 * @param value - Value to check
 * @returns Whether the value is a valid Task
 */
export function isTask(value: any): value is Task {
  const validation = validateTask(value);
  return validation.isValid;
}

/**
 * Type guard for User interface
 * @param value - Value to check
 * @returns Whether the value is a valid User
 */
export function isUser(value: any): value is User {
  const validation = validateUser(value);
  return validation.isValid;
}

/**
 * Type guard for AppState interface
 * @param value - Value to check
 * @returns Whether the value is a valid AppState
 */
export function isAppState(value: any): value is AppState {
  const validation = validateAppState(value);
  return validation.isValid;
}