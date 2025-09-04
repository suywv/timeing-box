import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import VoiceRecordButton from './VoiceRecordButton';
import VoiceRecordingModal from './VoiceRecordingModal';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { useAppContext } from '../context/AppContext';

interface VoiceRecordingInterfaceProps {
  onRecordingComplete?: (uri: string) => void;
  style?: any;
}

export default function VoiceRecordingInterface({
  onRecordingComplete,
  style,
}: VoiceRecordingInterfaceProps) {
  const { state, actions } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  
  const {
    isRecording,
    recordingUri,
    startRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecording();

  // Update app context recording state
  React.useEffect(() => {
    actions.setRecording(isRecording);
  }, [isRecording, actions]);

  const handleButtonPress = useCallback(() => {
    if (isRecording) {
      // If currently recording, stop recording
      handleStopRecording();
    } else {
      // If not recording, show modal
      setModalVisible(true);
      clearRecording(); // Clear any previous recordings
    }
  }, [isRecording]);

  const handleStartRecording = useCallback(async () => {
    const success = await startRecording();
    if (!success) {
      setModalVisible(false);
    }
  }, [startRecording]);

  const handleStopRecording = useCallback(async () => {
    const uri = await stopRecording();
    
    if (uri && onRecordingComplete) {
      onRecordingComplete(uri);
    }
    
    // For now, show a simple alert with the recording info
    if (uri) {
      Alert.alert(
        'Recording Complete',
        `Recording saved successfully!\n\nIn a real implementation, this would be processed to extract task information.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              clearRecording();
              setModalVisible(false);
            }
          }
        ]
      );
    } else {
      setModalVisible(false);
    }
  }, [stopRecording, onRecordingComplete, clearRecording]);

  const handleModalClose = useCallback(() => {
    if (isRecording) {
      handleStopRecording();
    } else {
      setModalVisible(false);
      clearRecording();
    }
  }, [isRecording, handleStopRecording, clearRecording]);

  return (
    <View style={[styles.container, style]}>
      <VoiceRecordButton
        isRecording={isRecording}
        onPress={handleButtonPress}
      />
      
      <VoiceRecordingModal
        visible={modalVisible}
        isRecording={isRecording}
        onClose={handleModalClose}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        autoCloseDelay={isRecording ? 0 : 3000} // Don't auto-close while recording
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    pointerEvents: 'box-none', // Allow touches to pass through to background
  },
});