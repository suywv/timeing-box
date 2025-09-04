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
import { COLORS, LAYOUT } from '../constants';
import { Task } from '../types';

interface EditTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (id: number, updates: Partial<Omit<Task, 'id'>>) => Promise<{ success: boolean; error?: string }>;
  availableSlots: number[];
}

const TASK_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
];

export default function EditTaskModal({
  visible,
  task,
  onClose,
  onUpdateTask,
  availableSlots,
}: EditTaskModalProps) {
  const [name, setName] = useState('');
  const [startSlot, setStartSlot] = useState(0);
  const [duration, setDuration] = useState(1);
  const [color, setColor] = useState(TASK_COLORS[0]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const slideAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible && task) {
      setName(task.name);
      setStartSlot(task.startSlot);
      setDuration(task.duration);
      setColor(task.color);
      setCompleted(task.completed);
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
  }, [visible, task]);

  const validateForm = (): boolean => {
    if (!task) return false;

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
    if (!task || !validateForm()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await onUpdateTask(task.id, {
        name: name.trim(),
        startSlot,
        duration,
        color,
        completed,
      });

      if (result.success) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to update task');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
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
    // Current task's slot is always available
    if (task && slot >= task.startSlot && slot < task.startSlot + task.duration) {
      return true;
    }
    return availableSlots.includes(slot);
  };

  if (!task) return null;

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
            <Text style={styles.title}>Edit Task</Text>

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

            {/* Completion Status */}
            <View style={styles.field}>
              <TouchableOpacity
                style={styles.completionToggle}
                onPress={() => {
                  setCompleted(!completed);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={[styles.checkbox, completed && styles.checkedBox]}>
                  {completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.completionText}>
                  Mark as {completed ? 'incomplete' : 'complete'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Color */}
            <View style={styles.field}>
              <Text style={styles.label}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPalette}>
                {TASK_COLORS.map((taskColor, index) => (
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
                {name || 'Task'} • {formatTime(startSlot)} - {formatTime(startSlot + duration)} ({duration}h)
                {completed && ' ✓'}
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
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius * 2,
    padding: LAYOUT.padding * 1.5,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: LAYOUT.padding,
    textAlign: 'center',
  },
  field: {
    marginBottom: LAYOUT.padding,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: LAYOUT.margin,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: LAYOUT.borderRadius,
    padding: LAYOUT.padding,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
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
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.borderRadius,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unavailableSlot: {
    backgroundColor: '#F5F5F5',
    borderColor: '#D1D1D6',
  },
  timeSlotText: {
    fontSize: 14,
    color: COLORS.text,
  },
  selectedTimeSlotText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  unavailableSlotText: {
    color: '#8E8E93',
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
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: LAYOUT.padding * 2,
  },
  disabledButton: {
    backgroundColor: '#D1D1D6',
  },
  disabledButtonText: {
    color: '#8E8E93',
  },
  completionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionText: {
    fontSize: 16,
    color: COLORS.text,
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
    borderColor: COLORS.text,
  },
  selectedColorIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  preview: {
    backgroundColor: COLORS.background,
    padding: LAYOUT.padding,
    borderRadius: LAYOUT.borderRadius,
    marginBottom: LAYOUT.padding,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 16,
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: LAYOUT.padding,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: LAYOUT.padding,
    marginRight: LAYOUT.margin,
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.borderRadius,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: LAYOUT.padding,
    marginLeft: LAYOUT.margin,
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});