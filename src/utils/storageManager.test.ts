import { StorageManager } from './storageManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
};

(AsyncStorage as any) = mockAsyncStorage;

describe('StorageManager', () => {
  let storageManager: StorageManager<any>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    storageManager = new StorageManager('test-key', {
      version: 1,
      migrations: {},
      enableChecksums: true,
      autoSaveInterval: 1000, // Shorter for tests
    });
  });

  afterEach(() => {
    storageManager.cleanup();
  });

  describe('load', () => {
    it('should return default value when no data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await storageManager.load({ test: 'default' });
      
      expect(result).toEqual({ test: 'default' });
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should load and return stored data', async () => {
      const storedData = {
        version: 1,
        lastSaved: '2023-01-01T00:00:00.000Z',
        data: { test: 'stored' },
        checksum: '123abc',
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));
      
      const result = await storageManager.load({ test: 'default' });
      
      expect(result).toEqual({ test: 'stored' });
    });

    it('should migrate data when version is old', async () => {
      const oldData = {
        version: 1,
        lastSaved: '2023-01-01T00:00:00.000Z',
        data: { oldField: 'value' },
      };

      // Create a new storage manager with migration
      const managerWithMigration = new StorageManager('test-key', {
        version: 2,
        migrations: {
          2: (old: any) => ({ newField: old.oldField }),
        },
        enableChecksums: false,
        autoSaveInterval: 1000,
      });

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(oldData));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await managerWithMigration.load({ newField: 'default' });

      expect(result).toEqual({ newField: 'value' });
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('should save data with correct format', async () => {
      const testData = { test: 'value' };
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await storageManager.save(testData);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        expect.stringContaining('"version":1')
      );

      const [, savedData] = mockAsyncStorage.setItem.mock.calls[0];
      const parsed = JSON.parse(savedData);
      
      expect(parsed.version).toBe(1);
      expect(parsed.data).toEqual(testData);
      expect(parsed.lastSaved).toBeDefined();
      expect(parsed.checksum).toBeDefined();
    });
  });

  describe('createBackup', () => {
    it('should create backup with metadata', async () => {
      const currentData = JSON.stringify({
        version: 1,
        data: { test: 'backup' },
        lastSaved: '2023-01-01T00:00:00.000Z',
      });

      mockAsyncStorage.getItem.mockResolvedValue(currentData);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const backupKey = await storageManager.createBackup('Test backup');

      expect(backupKey).toMatch(/^test-key_backup_\d+$/);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2); // backup data + metadata
    });
  });

  describe('clear', () => {
    it('should clear all related data', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue([
        'test-key',
        'test-key_backup_123',
        'test-key_backup_123_metadata',
        'other-key',
      ]);
      mockAsyncStorage.multiRemove.mockResolvedValue(undefined);

      await storageManager.clear();

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'test-key',
        'test-key_backup_123',
        'test-key_backup_123_metadata',
      ]);
    });
  });

  describe('queueAutoSave', () => {
    it('should batch multiple auto-save calls', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      
      storageManager.queueAutoSave({ test: 'first' });
      storageManager.queueAutoSave({ test: 'second' });
      storageManager.queueAutoSave({ test: 'third' });

      // Wait for auto-save timer
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should only save once with the latest data
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      
      const [, savedData] = mockAsyncStorage.setItem.mock.calls[0];
      const parsed = JSON.parse(savedData);
      expect(parsed.data).toEqual({ test: 'third' });
    });
  });
});