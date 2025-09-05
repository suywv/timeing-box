import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredData, StorageConfig, BackupMetadata, MigrationFunction } from '../types';

/**
 * Enhanced storage manager with versioning, migration, and backup support
 */
export class StorageManager<T = any> {
  private config: StorageConfig;
  private key: string;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private pendingSaveData: T | null = null;
  private lastSavePromise: Promise<void> | null = null;

  constructor(key: string, config: Partial<StorageConfig> = {}) {
    this.key = key;
    this.config = {
      version: 1,
      migrations: {},
      enableChecksums: true,
      autoSaveInterval: 30000, // 30 seconds
      ...config,
    };
  }

  /**
   * Calculate simple checksum for data integrity
   */
  private calculateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Validate data integrity using checksum
   */
  private validateChecksum(storedData: StoredData<T>): boolean {
    if (!this.config.enableChecksums || !storedData.checksum) {
      return true;
    }
    
    const dataString = JSON.stringify(storedData.data);
    const calculatedChecksum = this.calculateChecksum(dataString);
    return calculatedChecksum === storedData.checksum;
  }

  /**
   * Apply migrations to bring old data to current version
   */
  private async migrateData(storedData: StoredData<any>): Promise<T> {
    let currentData = storedData.data;
    let currentVersion = storedData.version || 1;

    // Apply migrations sequentially
    while (currentVersion < this.config.version) {
      const nextVersion = currentVersion + 1;
      const migration = this.config.migrations[nextVersion];
      
      if (!migration) {
        throw new Error(`Missing migration for version ${nextVersion}`);
      }

      console.log(`Migrating data from version ${currentVersion} to ${nextVersion}`);
      currentData = migration(currentData);
      currentVersion = nextVersion;
    }

    return currentData;
  }

  /**
   * Load data from storage with migration support
   */
  async load(defaultValue: T): Promise<T> {
    try {
      const stored = await AsyncStorage.getItem(this.key);
      
      if (!stored) {
        return defaultValue;
      }

      const storedData: StoredData<T> = JSON.parse(stored);
      
      // Validate data integrity
      if (!this.validateChecksum(storedData)) {
        console.warn('Data integrity check failed, using default value');
        return defaultValue;
      }

      // Check if migration is needed
      if (storedData.version < this.config.version) {
        const migratedData = await this.migrateData(storedData);
        // Save migrated data immediately
        await this.save(migratedData, { skipAutoSave: true });
        return migratedData;
      }

      return storedData.data;
    } catch (error) {
      console.error('Error loading data from storage:', error);
      return defaultValue;
    }
  }

  /**
   * Save data to storage with versioning and checksums
   */
  async save(data: T, options: { skipAutoSave?: boolean } = {}): Promise<void> {
    try {
      const dataString = JSON.stringify(data);
      const storedData: StoredData<T> = {
        version: this.config.version,
        lastSaved: new Date().toISOString(),
        data,
        checksum: this.config.enableChecksums ? this.calculateChecksum(dataString) : undefined,
      };

      await AsyncStorage.setItem(this.key, JSON.stringify(storedData));

      // Start auto-save timer if not skipped
      if (!options.skipAutoSave) {
        this.startAutoSave(data);
      }
    } catch (error) {
      console.error('Error saving data to storage:', error);
      throw error;
    }
  }

  /**
   * Queue data for auto-save to optimize performance
   */
  queueAutoSave(data: T): void {
    this.pendingSaveData = data;
    
    if (!this.autoSaveTimer) {
      this.startAutoSave(data);
    }
  }

  /**
   * Start or restart auto-save timer
   */
  private startAutoSave(data: T): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(async () => {
      if (this.pendingSaveData) {
        // Batch multiple updates
        const dataToSave = this.pendingSaveData;
        this.pendingSaveData = null;
        
        // Chain saves to prevent race conditions
        this.lastSavePromise = (this.lastSavePromise || Promise.resolve())
          .then(async () => {
            await this.save(dataToSave, { skipAutoSave: true });
          })
          .catch(console.error);
      }
      this.autoSaveTimer = null;
    }, this.config.autoSaveInterval);
  }

  /**
   * Force save any pending auto-save data
   */
  async flush(): Promise<void> {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }

    if (this.pendingSaveData) {
      const dataToSave = this.pendingSaveData;
      this.pendingSaveData = null;
      await this.save(dataToSave, { skipAutoSave: true });
    }

    // Wait for any pending saves to complete
    if (this.lastSavePromise) {
      await this.lastSavePromise;
    }
  }

  /**
   * Create a backup of current data
   */
  async createBackup(description?: string): Promise<string> {
    try {
      const currentData = await AsyncStorage.getItem(this.key);
      if (!currentData) {
        throw new Error('No data to backup');
      }

      const backupKey = `${this.key}_backup_${Date.now()}`;
      const metadata: BackupMetadata = {
        createdAt: new Date().toISOString(),
        version: this.config.version,
        size: currentData.length,
        description,
      };

      // Save backup data and metadata
      await AsyncStorage.setItem(backupKey, currentData);
      await AsyncStorage.setItem(`${backupKey}_metadata`, JSON.stringify(metadata));

      return backupKey;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Restore data from backup
   */
  async restoreFromBackup(backupKey: string): Promise<T> {
    try {
      const backupData = await AsyncStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }

      // Save current data as emergency backup first
      await this.createBackup('Pre-restore emergency backup');

      // Restore backup
      await AsyncStorage.setItem(this.key, backupData);
      
      // Load and migrate if necessary
      const storedData: StoredData<T> = JSON.parse(backupData);
      if (storedData.version < this.config.version) {
        return await this.migrateData(storedData);
      }

      return storedData.data;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }

  /**
   * Get list of available backups
   */
  async getBackups(): Promise<Array<{ key: string; metadata: BackupMetadata }>> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const backupKeys = allKeys.filter(key => 
        key.startsWith(`${this.key}_backup_`) && !key.endsWith('_metadata')
      );

      const backups = await Promise.all(
        backupKeys.map(async (key) => {
          try {
            const metadataString = await AsyncStorage.getItem(`${key}_metadata`);
            const metadata: BackupMetadata = metadataString 
              ? JSON.parse(metadataString)
              : {
                  createdAt: new Date().toISOString(),
                  version: 1,
                  size: 0,
                };
            return { key, metadata };
          } catch {
            return null;
          }
        })
      );

      return backups.filter(backup => backup !== null) as Array<{ key: string; metadata: BackupMetadata }>;
    } catch (error) {
      console.error('Error getting backup list:', error);
      return [];
    }
  }

  /**
   * Delete a specific backup
   */
  async deleteBackup(backupKey: string): Promise<void> {
    try {
      await AsyncStorage.multiRemove([backupKey, `${backupKey}_metadata`]);
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw error;
    }
  }

  /**
   * Clear all data including backups
   */
  async clear(): Promise<void> {
    try {
      // Get all keys to remove
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => 
        key === this.key || key.startsWith(`${this.key}_backup_`)
      );

      await AsyncStorage.multiRemove(keysToRemove);
      
      // Clear auto-save timer
      if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }
      this.pendingSaveData = null;
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageInfo(): Promise<{
    hasData: boolean;
    dataSize: number;
    lastSaved?: string;
    version: number;
    backupCount: number;
  }> {
    try {
      const stored = await AsyncStorage.getItem(this.key);
      const backups = await this.getBackups();

      if (!stored) {
        return {
          hasData: false,
          dataSize: 0,
          version: this.config.version,
          backupCount: backups.length,
        };
      }

      const storedData: StoredData<T> = JSON.parse(stored);
      return {
        hasData: true,
        dataSize: stored.length,
        lastSaved: storedData.lastSaved,
        version: storedData.version,
        backupCount: backups.length,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        hasData: false,
        dataSize: 0,
        version: this.config.version,
        backupCount: 0,
      };
    }
  }

  /**
   * Cleanup method to be called when component unmounts
   */
  cleanup(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}