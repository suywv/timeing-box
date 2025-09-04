import { useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export interface VoiceRecordingHook {
  recording: Audio.Recording | null;
  isRecording: boolean;
  recordingUri: string | null;
  recordingDuration: number;
  permissionResponse: Audio.PermissionResponse | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<string | null>;
  requestPermissions: () => Promise<boolean>;
  clearRecording: () => void;
}

export function useVoiceRecording(): VoiceRecordingHook {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionResponse, setPermissionResponse] = useState<Audio.PermissionResponse | null>(null);

  const isRecording = recording !== null;

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Requesting audio permissions...');
      const response = await Audio.requestPermissionsAsync();
      setPermissionResponse(response);
      
      if (response.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your microphone to record audio. Please enable microphone access in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to request audio permissions:', error);
      Alert.alert('Error', 'Failed to request microphone permissions.');
      return false;
    }
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      // Check permissions first
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        return false;
      }

      console.log('Starting recording...');
      
      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            setRecordingDuration(status.durationMillis || 0);
          }
        }
      );

      setRecording(newRecording);
      console.log('Recording started successfully');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
      return false;
    }
  }, [requestPermissions]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!recording) {
      console.warn('No active recording to stop');
      return null;
    }

    try {
      console.log('Stopping recording...');
      
      await recording.stopAndUnloadAsync();
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      console.log('Recording stopped. URI:', uri);
      
      setRecording(null);
      setRecordingUri(uri);
      setRecordingDuration(0);
      
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording properly.');
      setRecording(null);
      setRecordingDuration(0);
      return null;
    }
  }, [recording]);

  const clearRecording = useCallback(() => {
    setRecording(null);
    setRecordingUri(null);
    setRecordingDuration(0);
  }, []);

  return {
    recording,
    isRecording,
    recordingUri,
    recordingDuration,
    permissionResponse,
    startRecording,
    stopRecording,
    requestPermissions,
    clearRecording,
  };
}