import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { APP_NAME, COLORS, LAYOUT } from '../constants';
import TimeGrid from '../components/TimeGrid';
import { Task } from '../types';

export default function HomeScreen() {
  // Sample tasks to demonstrate the TimeGrid with various scenarios
  const [tasks] = useState<Task[]>([
    {
      id: 1,
      name: 'Morning Workout Session',
      startSlot: 6,
      duration: 2,
      completed: false,
      color: '#FF6B6B',
    },
    {
      id: 2,
      name: 'Work Meeting',
      startSlot: 9,
      duration: 1,
      completed: false,
      color: '#4ECDC4',
    },
    {
      id: 3,
      name: 'Lunch Break',
      startSlot: 12,
      duration: 1,
      completed: true,
      color: '#45B7D1',
    },
    {
      id: 4,
      name: 'Deep Focus Work Time - Important Project',
      startSlot: 14,
      duration: 3,
      completed: false,
      color: '#96CEB4',
    },
    {
      id: 5,
      name: 'Daily Review',
      startSlot: 18,
      duration: 1,
      completed: true,
      color: '#FECA57',
    },
    {
      id: 6,
      name: 'Family Dinner',
      startSlot: 19,
      duration: 2,
      completed: false,
      color: '#FF9FF3',
    },
  ]);

  const handleCellPress = (hour: number) => {
    Alert.alert('Time Selected', `You selected ${hour}:00`);
  };

  const handleCellLongPress = (hour: number) => {
    Alert.alert('Long Press', `Long pressed on ${hour}:00`);
  };

  const handleTaskPress = (task: Task) => {
    Alert.alert('Task Selected', `You selected "${task.name}" (${task.startSlot}:00-${task.startSlot + task.duration}:00)`);
  };

  const handleTaskLongPress = (task: Task) => {
    Alert.alert('Task Long Press', `Long pressed on "${task.name}"`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.subtitle}>24-Hour Time Grid</Text>
      <TimeGrid 
        tasks={tasks}
        onCellPress={handleCellPress}
        onCellLongPress={handleCellLongPress}
        onTaskPress={handleTaskPress}
        onTaskLongPress={handleTaskLongPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: LAYOUT.margin,
    paddingHorizontal: LAYOUT.padding,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.padding,
    paddingHorizontal: LAYOUT.padding,
  },
});