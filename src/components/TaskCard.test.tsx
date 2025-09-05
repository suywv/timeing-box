import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Animated } from 'react-native';
import TaskCard from './TaskCard';
import { Task } from '../types';

// Mock dependencies
const mockTask: Task = {
  id: 1,
  name: 'Test Task',
  startSlot: 9,
  duration: 2,
  completed: false,
  color: '#FF0000',
};

const mockCompletedTask: Task = {
  ...mockTask,
  id: 2,
  name: 'Completed Task',
  completed: true,
};

jest.mock('../context/ThemeContext', () => ({
  useThemeValues: () => ({
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
    },
    colors: {
      surface: {
        primary: '#FFFFFF',
      },
      text: {
        primary: '#000000',
        secondary: '#666666',
        tertiary: '#999999',
      },
      border: {
        light: '#E0E0E0',
      },
      success: '#00FF00',
      warning: '#FFA500',
    },
    layout: {
      borderRadius: {
        base: 8,
        md: 6,
      },
      shadow: {
        base: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
      },
    },
  }),
}));

jest.mock('../context/AppContext', () => ({
  useAppContext: () => ({
    state: {
      language: 'en',
      useArabicNumerals: false,
    },
  }),
}));

jest.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'task.hour': 'hour',
        'task.hours': 'hours',
        'task.completed': 'Completed',
        'task.pending': 'Pending',
      };
      return translations[key] || key;
    },
    isRTL: false,
  }),
}));

jest.mock('../utils/styleUtils', () => ({
  textStyles: {
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    body: {
      fontSize: 14,
      fontWeight: '400',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
    },
  },
}));

jest.mock('../utils', () => ({
  convertToArabicNumerals: (text: string) => text,
}));

jest.mock('./TaskActions', () => {
  const MockTaskActions = ({ onEdit, onDelete, onToggleComplete }: any) => (
    <div>
      <button onPress={onEdit} testID="edit-button">Edit</button>
      <button onPress={onDelete} testID="delete-button">Delete</button>
      <button onPress={onToggleComplete} testID="toggle-complete-button">Toggle</button>
    </div>
  );
  return MockTaskActions;
});

// Mock Animated.Value and animations
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      Value: jest.fn((value) => ({
        interpolate: jest.fn(() => value),
        setValue: jest.fn(),
      })),
      parallel: jest.fn((animations) => ({
        start: jest.fn(),
      })),
      spring: jest.fn(() => ({ start: jest.fn() })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      View: RN.View,
    },
    I18nManager: {
      isRTL: false,
    },
  };
});

describe('TaskCard', () => {
  const mockOnPress = jest.fn();
  const mockOnLongPress = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnToggleComplete = jest.fn();
  const mockOnMoveLeft = jest.fn();
  const mockOnMoveRight = jest.fn();
  const mockOnIncreaseDuration = jest.fn();
  const mockOnDecreaseDuration = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render task basic information', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onPress={mockOnPress} />
    );

    expect(getByText('Test Task')).toBeTruthy();
    expect(getByText('Pending')).toBeTruthy();
  });

  it('should display correct time format', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onPress={mockOnPress} />
    );

    // Task starts at slot 9 (09:00) and lasts 2 hours (until 11:00)
    expect(getByText(/09:00 - 11:00/)).toBeTruthy();
  });

  it('should display correct duration text', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onPress={mockOnPress} />
    );

    expect(getByText(/2 hours/)).toBeTruthy();
  });

  it('should display singular hour for 1-hour duration', () => {
    const oneHourTask = { ...mockTask, duration: 1 };
    const { getByText } = render(
      <TaskCard task={oneHourTask} onPress={mockOnPress} />
    );

    expect(getByText(/1 hour/)).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Test Task'));
    expect(mockOnPress).toHaveBeenCalledWith(mockTask);
  });

  it('should call onLongPress when long pressed', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onLongPress={mockOnLongPress} />
    );

    const touchable = getByText('Test Task').parent?.parent?.parent;
    fireEvent(touchable, 'longPress');
    expect(mockOnLongPress).toHaveBeenCalledWith(mockTask);
  });

  it('should show completed status for completed tasks', () => {
    const { getByText } = render(
      <TaskCard task={mockCompletedTask} onPress={mockOnPress} />
    );

    expect(getByText('Completed')).toBeTruthy();
    expect(getByText(/Completed Task ✓/)).toBeTruthy();
  });

  it('should apply completed task styling', () => {
    const { getByText } = render(
      <TaskCard task={mockCompletedTask} onPress={mockOnPress} />
    );

    const taskName = getByText(/Completed Task ✓/);
    expect(taskName.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#666666', // secondary text color for completed tasks
        }),
      ])
    );
  });

  it('should not show actions by default', () => {
    const { queryByTestId } = render(
      <TaskCard task={mockTask} onPress={mockOnPress} />
    );

    expect(queryByTestId('edit-button')).toBeFalsy();
    expect(queryByTestId('delete-button')).toBeFalsy();
  });

  it('should show actions when showActions is true and all action handlers provided', () => {
    const { getByTestId } = render(
      <TaskCard 
        task={mockTask}
        onPress={mockOnPress}
        showActions={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onMoveLeft={mockOnMoveLeft}
        onMoveRight={mockOnMoveRight}
        onIncreaseDuration={mockOnIncreaseDuration}
        onDecreaseDuration={mockOnDecreaseDuration}
      />
    );

    expect(getByTestId('edit-button')).toBeTruthy();
    expect(getByTestId('delete-button')).toBeTruthy();
    expect(getByTestId('toggle-complete-button')).toBeTruthy();
  });

  it('should not show actions when showActions is true but not all handlers provided', () => {
    const { queryByTestId } = render(
      <TaskCard 
        task={mockTask}
        onPress={mockOnPress}
        showActions={true}
        onEdit={mockOnEdit}
        // Missing other required handlers
      />
    );

    expect(queryByTestId('edit-button')).toBeFalsy();
  });

  it('should apply correct border color based on task color', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onPress={mockOnPress} />
    );

    const touchable = getByText('Test Task').parent?.parent?.parent;
    expect(touchable?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          borderLeftColor: '#FF0000',
        }),
      ])
    );
  });

  it('should show color indicator with task color', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onPress={mockOnPress} />
    );

    // The color indicator is the small colored circle next to the task name
    const container = getByText('Test Task').parent;
    const colorIndicator = container?.parent?.children?.[0];
    
    if (colorIndicator && typeof colorIndicator === 'object' && 'props' in colorIndicator) {
      expect(colorIndicator.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#FF0000',
          }),
        ])
      );
    }
  });

  describe('Arabic support', () => {
    beforeEach(() => {
      // Mock Arabic context
      const useAppContext = require('../context/AppContext').useAppContext;
      useAppContext.mockReturnValue({
        state: {
          language: 'ar',
          useArabicNumerals: true,
        },
      });

      const useTranslation = require('../hooks/useTranslation').useTranslation;
      useTranslation.mockReturnValue({
        t: (key: string) => key,
        isRTL: true,
      });

      const convertToArabicNumerals = require('../utils').convertToArabicNumerals;
      convertToArabicNumerals.mockImplementation((text: string) => 
        text.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
      );
    });

    it('should convert numerals to Arabic when Arabic numerals are enabled', () => {
      const { getByText } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );

      expect(getByText(/٠٩:٠٠ - ١١:٠٠/)).toBeTruthy();
      expect(getByText(/٢ hours/)).toBeTruthy();
    });
  });

  describe('time formatting', () => {
    it('should pad single digit hours with zero', () => {
      const earlyTask = { ...mockTask, startSlot: 5, duration: 1 };
      const { getByText } = render(
        <TaskCard task={earlyTask} onPress={mockOnPress} />
      );

      expect(getByText(/05:00 - 06:00/)).toBeTruthy();
    });

    it('should handle tasks that span to double digit hours', () => {
      const lateTask = { ...mockTask, startSlot: 23, duration: 1 };
      const { getByText } = render(
        <TaskCard task={lateTask} onPress={mockOnPress} />
      );

      expect(getByText(/23:00 - 24:00/)).toBeTruthy();
    });
  });

  describe('animation', () => {
    it('should initialize animations on mount', () => {
      render(<TaskCard task={mockTask} onPress={mockOnPress} />);

      expect(Animated.parallel).toHaveBeenCalled();
      expect(Animated.spring).toHaveBeenCalled();
      expect(Animated.timing).toHaveBeenCalled();
    });
  });
});