import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeValues } from '../context/ThemeContext';
import { textStyles } from '../utils/styleUtils';
import { Task } from '../types';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (taskData: Omit<Task, 'id'>) => Promise<{ success: boolean; error?: string }>;
  availableSlots: number[];
  suggestedSlot?: number;
}

export default function AddTaskModal({
  visible,
  onClose,
  onAddTask,
  availableSlots,
  suggestedSlot,
}: AddTaskModalProps) {
  const theme = useThemeValues();
  const [name, setName] = useState('');
  const [startSlot, setStartSlot] = useState(suggestedSlot || 9);
  const [duration, setDuration] = useState(1);
  const [color, setColor] = useState(theme.taskColors[0]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const slideAnim = new Animated.Value(0);

  // Create dynamic styles using theme
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.surface.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    modal: {
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.layout.borderRadius.lg,
      padding: theme.spacing.lg,
      width: '100%',
      maxHeight: '80%',
      ...theme.layout.shadow.lg,
    },
    title: {
      ...textStyles.title,
      fontSize: 24,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    field: {
      marginBottom: theme.spacing.md,
    },
    label: {
      ...textStyles.subtitle,
      marginBottom: theme.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      borderRadius: theme.layout.borderRadius.base,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    },
    timeSlots: {
      maxHeight: 50,
    },
    timeSlot: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginRight: 8,
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.layout.borderRadius.base,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    selectedTimeSlot: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    unavailableSlot: {
      backgroundColor: theme.colors.text.disabled + '20',
      borderColor: theme.colors.border.medium,
    },
    timeSlotText: {
      ...textStyles.body,
    },
    selectedTimeSlotText: {
      color: theme.colors.text.inverse,
      fontWeight: '600',
    },
    unavailableSlotText: {
      color: theme.colors.text.disabled,
    },
    durationControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    durationButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    durationButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text.inverse,
    },
    durationText: {
      ...textStyles.subtitle,
      marginHorizontal: theme.spacing['2xl'],
    },
    disabledButton: {
      backgroundColor: theme.colors.text.disabled,
    },
    disabledButtonText: {
      color: theme.colors.text.disabled,
    },
    colorPalette: {
      maxHeight: 60,
    },
    colorOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedColor: {
      borderColor: theme.colors.text.primary,
    },
    selectedColorIcon: {
      color: theme.colors.text.inverse,
      fontSize: 16,
      fontWeight: 'bold',
    },
    preview: {
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.md,
      borderRadius: theme.layout.borderRadius.base,
      marginBottom: theme.spacing.md,
    },
    previewLabel: {
      ...textStyles.secondary,
      fontWeight: '600',
      marginBottom: 4,
    },
    previewText: {
      ...textStyles.body,
      fontSize: 16,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.md,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      marginRight: theme.spacing.sm,
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.layout.borderRadius.base,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...textStyles.button,
      color: theme.colors.text.secondary,
    },
    addButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      marginLeft: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.layout.borderRadius.base,
      alignItems: 'center',
    },
    addButtonText: {
      ...textStyles.button,
    },
  });

  useEffect(() => {
    if (visible) {
      setName('');
      setStartSlot(suggestedSlot || 9);
      setDuration(1);
      setColor(theme.taskColors[0]);
      setErrors({});
      
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, suggestedSlot]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Task name is required';
    }

    if (startSlot < 0 || startSlot > 23) {
      newErrors.startSlot = 'Start time must be between 00:00 and 23:00';
    }

    if (duration < 1 || duration > 24) {
      newErrors.duration = 'Duration must be between 1 and 24 hours';
    }

    if (startSlot + duration > 24) {
      newErrors.duration = 'Task cannot extend beyond 23:59';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await onAddTask({
        name: name.trim(),
        startSlot,
        duration,
        color,
        completed: false,
      });

      if (result.success) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to add task');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const formatTime = (slot: number): string => {
    return `${slot.toString().padStart(2, '0')}:00`;
  };

  const isSlotAvailable = (slot: number): boolean => {
    return availableSlots.includes(slot);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
                {
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Add New Task</Text>

            {/* Task Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Task Name</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                value={name}
                onChangeText={setName}
                placeholder="Enter task name..."
                maxLength={50}
                returnKeyType="next"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Start Time */}
            <View style={styles.field}>
              <Text style={styles.label}>Start Time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlots}>
                {Array.from({ length: 24 }, (_, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.timeSlot,
                      startSlot === i && styles.selectedTimeSlot,
                      !isSlotAvailable(i) && styles.unavailableSlot,
                    ]}
                    onPress={() => {
                      if (isSlotAvailable(i)) {
                        setStartSlot(i);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    disabled={!isSlotAvailable(i)}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      startSlot === i && styles.selectedTimeSlotText,
                      !isSlotAvailable(i) && styles.unavailableSlotText,
                    ]}>
                      {formatTime(i)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {errors.startSlot && <Text style={styles.errorText}>{errors.startSlot}</Text>}
            </View>

            {/* Duration */}
            <View style={styles.field}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.durationControls}>
                <TouchableOpacity
                  style={[styles.durationButton, duration <= 1 && styles.disabledButton]}
                  onPress={() => {
                    if (duration > 1) {
                      setDuration(duration - 1);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  disabled={duration <= 1}
                >
                  <Text style={[styles.durationButtonText, duration <= 1 && styles.disabledButtonText]}>-</Text>
                </TouchableOpacity>

                <Text style={styles.durationText}>{duration} hour{duration > 1 ? 's' : ''}</Text>

                <TouchableOpacity
                  style={[styles.durationButton, (duration >= 24 || startSlot + duration >= 24) && styles.disabledButton]}
                  onPress={() => {
                    if (duration < 24 && startSlot + duration < 24) {
                      setDuration(duration + 1);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  disabled={duration >= 24 || startSlot + duration >= 24}
                >
                  <Text style={[styles.durationButtonText, (duration >= 24 || startSlot + duration >= 24) && styles.disabledButtonText]}>+</Text>
                </TouchableOpacity>
              </View>
              {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
            </View>

            {/* Color */}
            <View style={styles.field}>
              <Text style={styles.label}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPalette}>
                {theme.taskColors.map((taskColor, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorOption,
                      { backgroundColor: taskColor },
                      color === taskColor && styles.selectedColor,
                    ]}
                    onPress={() => {
                      setColor(taskColor);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    {color === taskColor && (
                      <Text style={styles.selectedColorIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Time Preview */}
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Preview:</Text>
              <Text style={styles.previewText}>
                {name || 'New Task'} • {formatTime(startSlot)} - {formatTime(startSlot + duration)} ({duration}h)
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.addButtonText}>
                  {loading ? 'Adding...' : 'Add Task'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

