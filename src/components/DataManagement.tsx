import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { BackupMetadata } from '../types';

interface DataManagementProps {
  visible: boolean;
  onClose: () => void;
}

export function DataManagement({ visible, onClose }: DataManagementProps) {
  const { actions } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<Array<{ key: string; metadata: BackupMetadata }>>([]);
  const [storageInfo, setStorageInfo] = useState<{
    hasData: boolean;
    dataSize: number;
    lastSaved?: string;
    version: number;
    backupCount: number;
  }>({
    hasData: false,
    dataSize: 0,
    lastSaved: undefined,
    version: 1,
    backupCount: 0,
  });
  const [backupDescription, setBackupDescription] = useState('');

  useEffect(() => {
    if (visible) {
      loadStorageInfo();
      loadBackups();
    }
  }, [visible]);

  const loadStorageInfo = async () => {
    try {
      const info = await actions.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const loadBackups = async () => {
    try {
      const backupList = await actions.getBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('Error loading backups:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const backupKey = await actions.createBackup(backupDescription || undefined);
      
      if (backupKey) {
        Alert.alert(
          'Backup Created',
          'Your data has been backed up successfully.',
          [{ text: 'OK', onPress: () => {
            setBackupDescription('');
            loadBackups();
            loadStorageInfo();
          }}]
        );
      } else {
        Alert.alert('Error', 'Failed to create backup. Please try again.');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      Alert.alert('Error', 'Failed to create backup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = (backupKey: string, metadata: BackupMetadata) => {
    Alert.alert(
      'Restore Backup',
      `Are you sure you want to restore from backup created on ${new Date(metadata.createdAt).toLocaleString()}? This will replace all current data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restore', 
          style: 'destructive',
          onPress: () => performRestore(backupKey)
        }
      ]
    );
  };

  const performRestore = async (backupKey: string) => {
    try {
      setLoading(true);
      const success = await actions.restoreFromBackup(backupKey);
      
      if (success) {
        Alert.alert(
          'Restore Complete',
          'Your data has been restored successfully.',
          [{ text: 'OK', onPress: () => {
            loadStorageInfo();
            onClose();
          }}]
        );
      } else {
        Alert.alert('Error', 'Failed to restore backup. Please try again.');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      Alert.alert('Error', 'Failed to restore backup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = (backupKey: string, metadata: BackupMetadata) => {
    Alert.alert(
      'Delete Backup',
      `Are you sure you want to delete backup created on ${new Date(metadata.createdAt).toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => performDeleteBackup(backupKey)
        }
      ]
    );
  };

  const performDeleteBackup = async (backupKey: string) => {
    try {
      setLoading(true);
      const success = await actions.deleteBackup(backupKey);
      
      if (success) {
        loadBackups();
        loadStorageInfo();
      } else {
        Alert.alert('Error', 'Failed to delete backup. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      Alert.alert('Error', 'Failed to delete backup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all data including tasks and backups? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: performClearData
        }
      ]
    );
  };

  const performClearData = async () => {
    try {
      setLoading(true);
      const success = await actions.clearAllData();
      
      if (success) {
        Alert.alert(
          'Data Cleared',
          'All data has been cleared successfully.',
          [{ text: 'OK', onPress: () => {
            loadStorageInfo();
            loadBackups();
          }}]
        );
      } else {
        Alert.alert('Error', 'Failed to clear data. Please try again.');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      Alert.alert('Error', 'Failed to clear data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Data Management</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Storage Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Storage Information</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoRow}>
                Data Size: {formatFileSize(storageInfo.dataSize)}
              </Text>
              <Text style={styles.infoRow}>
                Schema Version: {storageInfo.version}
              </Text>
              <Text style={styles.infoRow}>
                Backups: {storageInfo.backupCount}
              </Text>
              {storageInfo.lastSaved && (
                <Text style={styles.infoRow}>
                  Last Saved: {new Date(storageInfo.lastSaved).toLocaleString()}
                </Text>
              )}
            </View>
          </View>

          {/* Backup Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backup Management</Text>
            
            {/* Create Backup */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create Backup</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Optional description"
                value={backupDescription}
                onChangeText={setBackupDescription}
                maxLength={100}
              />
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleCreateBackup}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>Create Backup</Text>
              </TouchableOpacity>
            </View>

            {/* Backup List */}
            {backups.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Available Backups</Text>
                {backups.map(({ key, metadata }) => (
                  <View key={key} style={styles.backupItem}>
                    <View style={styles.backupInfo}>
                      <Text style={styles.backupDate}>
                        {new Date(metadata.createdAt).toLocaleString()}
                      </Text>
                      {metadata.description && (
                        <Text style={styles.backupDescription}>
                          {metadata.description}
                        </Text>
                      )}
                      <Text style={styles.backupSize}>
                        Size: {formatFileSize(metadata.size)}
                      </Text>
                    </View>
                    <View style={styles.backupActions}>
                      <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={() => handleRestoreBackup(key, metadata)}
                        disabled={loading}
                      >
                        <Text style={styles.secondaryButtonText}>Restore</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.dangerButton]}
                        onPress={() => handleDeleteBackup(key, metadata)}
                        disabled={loading}
                      >
                        <Text style={styles.dangerButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            <View style={styles.card}>
              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleClearAllData}
                disabled={loading}
              >
                <Text style={styles.dangerButtonText}>Clear All Data</Text>
              </TouchableOpacity>
              <Text style={styles.warningText}>
                This will permanently delete all tasks and backups
              </Text>
            </View>
          </View>
        </ScrollView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
    marginRight: 10,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backupInfo: {
    flex: 1,
  },
  backupDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  backupDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  backupSize: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  backupActions: {
    flexDirection: 'row',
  },
  warningText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});