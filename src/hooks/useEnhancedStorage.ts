import { useState, useEffect, useCallback, useRef } from 'react';
import { StorageManager } from '../utils/storageManager';
import { StorageConfig, BackupMetadata } from '../types';

/**
 * Hook for enhanced storage with auto-save, migration, and backup support
 */
export function useEnhancedStorage<T>(
  key: string,
  defaultValue: T,
  config?: Partial<StorageConfig>
) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const storageManagerRef = useRef<StorageManager<T>>();
  const isMountedRef = useRef(true);

  // Initialize storage manager
  useEffect(() => {
    storageManagerRef.current = new StorageManager<T>(key, config);
    
    return () => {
      isMountedRef.current = false;
      storageManagerRef.current?.cleanup();
    };
  }, [key]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedValue = await storageManagerRef.current?.load(defaultValue);
        if (isMountedRef.current && loadedValue !== undefined) {
          setValue(loadedValue);
        }
      } catch (err) {
        const errorMessage = `Error loading data: ${err}`;
        console.error(errorMessage);
        if (isMountedRef.current) {
          setError(errorMessage);
          setValue(defaultValue);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    if (storageManagerRef.current) {
      loadData();
    }
  }, [key, defaultValue]);

  /**
   * Update value and trigger auto-save
   */
  const updateValue = useCallback(async (newValue: T, options: { immediate?: boolean } = {}) => {
    try {
      setError(null);
      setValue(newValue);

      if (options.immediate) {
        await storageManagerRef.current?.save(newValue);
      } else {
        storageManagerRef.current?.queueAutoSave(newValue);
      }
    } catch (err) {
      const errorMessage = `Error saving data: ${err}`;
      console.error(errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Force save any pending auto-save data
   */
  const flush = useCallback(async () => {
    try {
      await storageManagerRef.current?.flush();
    } catch (err) {
      console.error('Error flushing storage:', err);
    }
  }, []);

  /**
   * Create backup of current data
   */
  const createBackup = useCallback(async (description?: string): Promise<string | null> => {
    try {
      setError(null);
      const backupKey = await storageManagerRef.current?.createBackup(description);
      return backupKey || null;
    } catch (err) {
      const errorMessage = `Error creating backup: ${err}`;
      console.error(errorMessage);
      setError(errorMessage);
      return null;
    }
  }, []);

  /**
   * Restore data from backup
   */
  const restoreFromBackup = useCallback(async (backupKey: string): Promise<boolean> => {
    try {
      setError(null);
      const restoredData = await storageManagerRef.current?.restoreFromBackup(backupKey);
      if (restoredData !== undefined && isMountedRef.current) {
        setValue(restoredData);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = `Error restoring backup: ${err}`;
      console.error(errorMessage);
      setError(errorMessage);
      return false;
    }
  }, []);

  /**
   * Get list of available backups
   */
  const getBackups = useCallback(async (): Promise<Array<{ key: string; metadata: BackupMetadata }>> => {
    try {
      return await storageManagerRef.current?.getBackups() || [];
    } catch (err) {
      console.error('Error getting backups:', err);
      return [];
    }
  }, []);

  /**
   * Delete a specific backup
   */
  const deleteBackup = useCallback(async (backupKey: string): Promise<boolean> => {
    try {
      await storageManagerRef.current?.deleteBackup(backupKey);
      return true;
    } catch (err) {
      console.error('Error deleting backup:', err);
      return false;
    }
  }, []);

  /**
   * Clear all data including backups
   */
  const clearAllData = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      await storageManagerRef.current?.clear();
      if (isMountedRef.current) {
        setValue(defaultValue);
      }
      return true;
    } catch (err) {
      const errorMessage = `Error clearing data: ${err}`;
      console.error(errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [defaultValue]);

  /**
   * Get storage statistics
   */
  const getStorageInfo = useCallback(async () => {
    try {
      return await storageManagerRef.current?.getStorageInfo() || {
        hasData: false,
        dataSize: 0,
        version: 1,
        backupCount: 0,
      };
    } catch (err) {
      console.error('Error getting storage info:', err);
      return {
        hasData: false,
        dataSize: 0,
        version: 1,
        backupCount: 0,
      };
    }
  }, []);

  return {
    // Current state
    value,
    loading,
    error,
    
    // Core operations
    setValue: updateValue,
    flush,
    
    // Backup operations
    createBackup,
    restoreFromBackup,
    getBackups,
    deleteBackup,
    
    // Utility operations
    clearAllData,
    getStorageInfo,
  };
}