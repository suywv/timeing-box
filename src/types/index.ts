/**
 * User interface for authentication and user data
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Task interface representing a scheduled activity
 */
export interface Task {
  /** Unique identifier for the task */
  id: number;
  /** Display name of the task */
  name: string;
  /** Starting time slot (0-23 representing hours) */
  startSlot: number;
  /** Duration in number of slots */
  duration: number;
  /** Whether the task is completed */
  completed: boolean;
  /** Color for visual representation */
  color: string;
}

/**
 * Main application state interface
 */
export interface AppState {
  /** List of all tasks */
  tasks: Task[];
  /** Whether voice recording is active */
  isRecording: boolean;
  /** Selected time interval for scheduling */
  selectedInterval: number;
  /** Current time reference */
  currentTime: Date;
  /** Loading state for async operations */
  isLoading: boolean;
  /** Current authenticated user */
  user: User | null;
  /** App language setting */
  language: 'en' | 'ar';
}