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
  /** Use Arabic numerals (Eastern Arabic numerals) */
  useArabicNumerals: boolean;
  /** Force RTL layout regardless of system setting */
  forceRTL: boolean;
}

/**
 * Versioned data structure for storage
 */
export interface StoredData<T = any> {
  /** Schema version for migration purposes */
  version: number;
  /** Timestamp when data was last saved */
  lastSaved: string;
  /** The actual data */
  data: T;
  /** Checksum for data integrity validation */
  checksum?: string;
}

/**
 * Migration function type
 */
export type MigrationFunction<TFrom = any, TTo = any> = (oldData: TFrom) => TTo;

/**
 * Storage configuration
 */
export interface StorageConfig {
  /** Current schema version */
  version: number;
  /** Migration functions for each version */
  migrations: Record<number, MigrationFunction>;
  /** Whether to enable data integrity checks */
  enableChecksums: boolean;
  /** Auto-save interval in milliseconds */
  autoSaveInterval: number;
}

/**
 * Backup metadata
 */
export interface BackupMetadata {
  /** Backup creation timestamp */
  createdAt: string;
  /** Data version at time of backup */
  version: number;
  /** Size of backup data in bytes */
  size: number;
  /** Optional description */
  description?: string;
}