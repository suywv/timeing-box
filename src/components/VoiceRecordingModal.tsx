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
import { useThemeValues } from '../context/ThemeContext';
import { textStyles } from '../utils/styleUtils';

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
  const theme = useThemeValues();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const microphoneScaleAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(1)).current;
  const waveAnim2 = useRef(new Animated.Value(1)).current;
  const waveAnim3 = useRef(new Animated.Value(1)).current;
  
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');

  // Create dynamic styles using theme
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.surface.overlay,
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
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.layout.borderRadius.lg,
      width: screenWidth * 0.9,
      maxWidth: 400,
      ...theme.layout.shadow.lg,
    },
    modalContent: {
      padding: theme.spacing['2xl'],
      alignItems: 'center',
    },
    title: {
      ...textStyles.title,
      fontSize: 24,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    microphoneContainer: {
      position: 'relative',
      width: 120,
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: theme.spacing['2xl'],
    },
    audioWave: {
      position: 'absolute',
      borderRadius: 60,
      borderWidth: 2,
    },
    wave1: {
      width: 140,
      height: 140,
      borderColor: theme.colors.primary,
    },
    wave2: {
      width: 160,
      height: 160,
      borderColor: theme.colors.secondary,
    },
    wave3: {
      width: 180,
      height: 180,
      borderColor: theme.colors.primary,
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
      ...theme.layout.shadow.base,
    },
    microphoneIcon: {
      fontSize: 32,
      color: theme.colors.text.inverse,
    },
    instruction: {
      ...textStyles.subtitle,
      fontSize: 18,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    status: {
      ...textStyles.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing['2xl'],
      paddingHorizontal: theme.spacing.md,
    },
    closeButton: {
      backgroundColor: theme.colors.text.secondary,
      paddingHorizontal: theme.spacing['2xl'],
      paddingVertical: theme.spacing.md,
      borderRadius: theme.layout.borderRadius.base,
      minWidth: 100,
      alignItems: 'center',
    },
    closeButtonText: {
      ...textStyles.button,
      fontSize: 16,
    },
  });

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
                      backgroundColor: isRecording ? theme.colors.error : theme.colors.primary,
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

