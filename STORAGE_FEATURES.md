# Enhanced Data Persistence and State Management

This document describes the comprehensive data persistence and state management features implemented in the Timing Box app.

## Features Implemented

### ✅ Auto-Save Functionality
- **30-second auto-save intervals** - Data is automatically saved every 30 seconds
- **Performance optimized** - Multiple rapid changes are batched into a single save operation
- **Configurable intervals** - Auto-save timing can be adjusted via storage configuration

### ✅ Data Migration System
- **Schema versioning** - All data is stored with version information
- **Automatic migration** - Old data is automatically upgraded to new schemas
- **Migration chains** - Sequential migrations from any version to current
- **Error handling** - Failed migrations fall back to default values

### ✅ Backup and Restore
- **Manual backups** - Users can create named backups with descriptions
- **Automatic backups** - Emergency backups created before data operations
- **Restore functionality** - Full data restore from any backup
- **Backup management** - List, delete, and manage multiple backups

### ✅ Data Integrity
- **Checksum validation** - Data integrity verified on load
- **Corruption recovery** - Falls back to defaults if data is corrupted
- **Error recovery** - Comprehensive error handling throughout

### ✅ Storage Management UI
- **Storage information** - View data size, version, backup count
- **Backup creation** - Create backups with optional descriptions
- **Backup restoration** - Restore from available backups
- **Data clearing** - Clear all data including backups

### ✅ Performance Optimizations
- **Batch updates** - Multiple state changes batched into single saves
- **Debounced saving** - Rapid changes don't trigger excessive saves
- **Memory management** - Automatic cleanup on component unmount
- **Race condition prevention** - Serialized save operations

## Technical Implementation

### Core Components

1. **StorageManager** (`src/utils/storageManager.ts`)
   - Comprehensive storage management with versioning
   - Auto-save with debouncing and batching
   - Backup/restore functionality
   - Data integrity checks with checksums

2. **useEnhancedStorage** (`src/hooks/useEnhancedStorage.ts`)
   - React hook wrapper for StorageManager
   - State management integration
   - Error handling and loading states

3. **AppContext Enhancement** (`src/context/AppContext.tsx`)
   - Integrated enhanced storage
   - Auto-save for all state changes
   - Exposed backup/restore actions

4. **DataManagement Component** (`src/components/DataManagement.tsx`)
   - Complete UI for storage management
   - Backup creation and restoration
   - Storage information display
   - Clear data functionality

### Storage Format

Data is stored in a versioned format:

```typescript
interface StoredData<T> {
  version: number;           // Schema version
  lastSaved: string;        // ISO timestamp
  data: T;                  // Actual data
  checksum?: string;        // Integrity checksum
}
```

### Configuration

Storage behavior is configurable:

```typescript
interface StorageConfig {
  version: number;                               // Current schema version
  migrations: Record<number, MigrationFunction>; // Version migrations
  enableChecksums: boolean;                      // Enable integrity checks
  autoSaveInterval: number;                      // Auto-save interval in ms
}
```

## Usage Examples

### Basic Usage in Components

```typescript
import { useAppContext } from '../context/AppContext';

function MyComponent() {
  const { state, actions } = useAppContext();
  
  // Data is automatically saved every 30 seconds
  const handleAddTask = () => {
    actions.addTask(newTask);
    // No manual save needed!
  };
  
  // Create backup
  const handleBackup = async () => {
    const backupKey = await actions.createBackup('Before major changes');
    console.log('Backup created:', backupKey);
  };
  
  // Clear all data
  const handleClearData = async () => {
    const success = await actions.clearAllData();
    if (success) {
      console.log('All data cleared');
    }
  };
}
```

### Adding Data Migration

```typescript
// When updating schema from version 1 to 2
const storageConfig = {
  version: 2,
  migrations: {
    2: (oldData: V1Data): V2Data => {
      return {
        ...oldData,
        newField: 'default value',
        renamedField: oldData.oldFieldName,
      };
    },
  },
  enableChecksums: true,
  autoSaveInterval: 30000,
};
```

### Using the DataManagement Component

```typescript
import { DataManagement } from '../components/DataManagement';

function SettingsScreen() {
  const [showDataManagement, setShowDataManagement] = useState(false);
  
  return (
    <View>
      <Button 
        title="Manage Data" 
        onPress={() => setShowDataManagement(true)} 
      />
      
      <DataManagement
        visible={showDataManagement}
        onClose={() => setShowDataManagement(false)}
      />
    </View>
  );
}
```

## Error Handling

The storage system includes comprehensive error handling:

- **Load errors** - Fall back to default values
- **Save errors** - Retry with exponential backoff
- **Migration errors** - Skip broken migrations, warn user
- **Corruption detection** - Checksum validation on load
- **Network errors** - Queue saves for retry when available

## Performance Considerations

- **Auto-save batching** - Multiple rapid changes batched into single save
- **Memory management** - Automatic cleanup prevents memory leaks  
- **Background processing** - Storage operations don't block UI
- **Size optimization** - Checksums and metadata add minimal overhead
- **Race condition prevention** - Serialized save operations

## Security

- **No sensitive data exposure** - Storage operations logged safely
- **Checksum validation** - Prevents data tampering
- **Backup encryption** - Can be extended with encryption layers
- **Access control** - Storage scoped to app sandbox

## Testing

Comprehensive test suite covers:
- Data loading and saving
- Migration functionality
- Backup and restore operations
- Error handling scenarios
- Performance optimizations

Run tests with: `npm test src/utils/storageManager.test.ts`

## Future Enhancements

Potential future improvements:
- **Cloud backup sync** - Sync backups to cloud storage
- **Encryption** - Add data encryption for sensitive information
- **Compression** - Compress large data sets
- **Selective sync** - Sync only changed data portions
- **Conflict resolution** - Handle concurrent modifications