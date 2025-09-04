import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Enhanced hook for local storage with better error handling and validation
 * @param key - Storage key
 * @param defaultValue - Default value to use if no stored value exists
 * @param validator - Optional validation function for stored data
 * @returns Object with storage operations
 */
export function useLocalStorage<T>(
  key: string, 
  defaultValue: T,
  validator?: (value: any) => value is T
) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load value from storage
   */
  const loadValue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stored = await AsyncStorage.getItem(key);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        
        // Validate if validator is provided
        if (validator && !validator(parsed)) {
          console.warn(`Invalid data format for key "${key}", using default value`);
          setValue(defaultValue);
          return;
        }
        
        setValue(parsed);
      } else {
        setValue(defaultValue);
      }
    } catch (error) {
      const errorMessage = `Error loading from storage: ${error}`;
      console.error(errorMessage);
      setError(errorMessage);
      setValue(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue, validator]);

  /**
   * Save value to storage
   */
  const saveValue = useCallback(async (newValue: T) => {
    try {
      setError(null);
      
      // Validate if validator is provided
      if (validator && !validator(newValue)) {
        throw new Error('Value failed validation');
      }
      
      setValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      const errorMessage = `Error saving to storage: ${error}`;
      console.error(errorMessage);
      setError(errorMessage);
      throw error; // Re-throw to let caller handle
    }
  }, [key, validator]);

  /**
   * Remove value from storage
   */
  const removeValue = useCallback(async () => {
    try {
      setError(null);
      await AsyncStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      const errorMessage = `Error removing from storage: ${error}`;
      console.error(errorMessage);
      setError(errorMessage);
      throw error;
    }
  }, [key, defaultValue]);

  /**
   * Check if key exists in storage
   */
  const hasValue = useCallback(async (): Promise<boolean> => {
    try {
      const stored = await AsyncStorage.getItem(key);
      return stored !== null;
    } catch (error) {
      console.error('Error checking storage:', error);
      return false;
    }
  }, [key]);

  // Load initial value
  useEffect(() => {
    loadValue();
  }, [loadValue]);

  return {
    value,
    setValue: saveValue,
    loading,
    error,
    removeValue,
    hasValue,
    reload: loadValue,
  };
}

/**
 * Legacy alias for backwards compatibility
 */
export const useAsyncStorage = useLocalStorage;