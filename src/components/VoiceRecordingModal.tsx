import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
  I18nManager,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { COLORS, LAYOUT } from '../constants';

interface VoiceRecordingModalProps {
  visible: boolean;
  isRecording: boolean;
  onClose: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  autoCloseDelay?: number; // For testing - auto close after X seconds
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function VoiceRecordingModal({
  visible,
  isRecording,
  onClose,
  onStartRecording,
  onStopRecording,
  autoCloseDelay = 3000, // 3 seconds for testing
}: VoiceRecordingModalProps) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const microphoneScaleAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(1)).current;
  const waveAnim2 = useRef(new Animated.Value(1)).current;
  const waveAnim3 = useRef(new Animated.Value(1)).current;
  
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');

  // Auto-close timer for testing
  useEffect(() => {
    if (visible && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [visible, autoCloseDelay]);

  // Check permissions when modal opens
  useEffect(() => {
    if (visible) {
      checkAudioPermissions();
    }
  }, [visible]);

  // Recording time counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Animations
  useEffect(() => {
    if (visible) {
      // Slide up and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Start microphone breathing animation
      const micBreathing = Animated.loop(
        Animated.sequence([
          Animated.timing(microphoneScaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(microphoneScaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      micBreathing.start();

      return () => {
        micBreathing.stop();
      };
    } else {
      // Slide down and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Recording wave animations
  useEffect(() => {
    if (isRecording) {
      const waveAnimation1 = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim1, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim1, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      const waveAnimation2 = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim2, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim2, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );

      const waveAnimation3 = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim3, {
            toValue: 1.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim3, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      waveAnimation1.start();
      setTimeout(() => waveAnimation2.start(), 200);
      setTimeout(() => waveAnimation3.start(), 400);

      return () => {
        waveAnimation1.stop();
        waveAnimation2.stop();
        waveAnimation3.stop();
      };
    }
  }, [isRecording]);

  const checkAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionStatus(status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Microphone Permission',
          'We need access to your microphone to record audio. Please enable microphone access in settings.',
          [{ text: 'OK', onPress: handleClose }]
        );
      }
    } catch (error) {
      console.error('Error checking audio permissions:', error);
      Alert.alert('Error', 'Failed to check microphone permissions');
    }
  };

  const handleClose = () => {
    if (isRecording) {
      onStopRecording();
    }
    onClose();
  };

  const handleMicrophonePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (permissionStatus !== 'granted') {
      await checkAudioPermissions();
      return;
    }

    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.backgroundTouchable}
          onPress={handleClose}
          activeOpacity={1}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <Text style={styles.title}>
              {isRecording 
                ? (I18nManager.isRTL ? 'جاري التسجيل' : 'Recording')
                : (I18nManager.isRTL ? 'تسجيل صوتي' : 'Voice Recording')
              }
            </Text>

            {/* Microphone Icon with Waves */}
            <View style={styles.microphoneContainer}>
              {/* Audio waves during recording */}
              {isRecording && (
                <>
                  <Animated.View
                    style={[
                      styles.audioWave,
                      styles.wave1,
                      {
                        transform: [{ scale: waveAnim1 }],
                        opacity: waveAnim1.interpolate({
                          inputRange: [1, 1.5],
                          outputRange: [0.3, 0],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.audioWave,
                      styles.wave2,
                      {
                        transform: [{ scale: waveAnim2 }],
                        opacity: waveAnim2.interpolate({
                          inputRange: [1, 1.3],
                          outputRange: [0.4, 0],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.audioWave,
                      styles.wave3,
                      {
                        transform: [{ scale: waveAnim3 }],
                        opacity: waveAnim3.interpolate({
                          inputRange: [1, 1.4],
                          outputRange: [0.5, 0],
                        }),
                      },
                    ]}
                  />
                </>
              )}

              {/* Main microphone icon */}
              <TouchableOpacity
                style={styles.microphoneButton}
                onPress={handleMicrophonePress}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.microphoneIconContainer,
                    {
                      transform: [{ scale: microphoneScaleAnim }],
                      backgroundColor: isRecording ? '#FF3B30' : COLORS.primary,
                    },
                  ]}
                >
                  <Text style={styles.microphoneIcon}>🎤</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <Text style={styles.instruction}>
              {isRecording 
                ? (I18nManager.isRTL ? `${formatTime(recordingTime)}` : `${formatTime(recordingTime)}`)
                : (I18nManager.isRTL 
                    ? 'قل اسم المهمة والوقت المطلوب' 
                    : 'Say task name and required time')
              }
            </Text>

            {/* Status */}
            <Text style={styles.status}>
              {isRecording
                ? (I18nManager.isRTL ? 'اضغط لإيقاف التسجيل' : 'Tap to stop recording')
                : (I18nManager.isRTL ? 'اضغط على الميكروفون للتسجيل' : 'Tap microphone to record')
              }
            </Text>

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>
                {I18nManager.isRTL ? 'إغلاق' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius * 2,
    width: screenWidth * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalContent: {
    padding: LAYOUT.padding * 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: LAYOUT.padding * 1.5,
    textAlign: 'center',
  },
  microphoneContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: LAYOUT.padding * 2,
  },
  audioWave: {
    position: 'absolute',
    borderRadius: 60,
    borderWidth: 2,
  },
  wave1: {
    width: 140,
    height: 140,
    borderColor: COLORS.primary,
  },
  wave2: {
    width: 160,
    height: 160,
    borderColor: COLORS.secondary,
  },
  wave3: {
    width: 180,
    height: 180,
    borderColor: COLORS.primary,
  },
  microphoneButton: {
    zIndex: 10,
  },
  microphoneIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  microphoneIcon: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: LAYOUT.margin,
    paddingHorizontal: LAYOUT.padding,
  },
  status: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.padding * 2,
    paddingHorizontal: LAYOUT.padding,
  },
  closeButton: {
    backgroundColor: COLORS.textSecondary,
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding,
    borderRadius: LAYOUT.borderRadius,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});