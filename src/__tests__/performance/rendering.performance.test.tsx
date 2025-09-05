import React from 'react';
import { render } from '@testing-library/react-native';
import { Task } from '../../types';
import TaskCard from '../../components/TaskCard';

// Mock dependencies for performance testing
jest.mock('../../context/ThemeContext', () => ({
  useThemeValues: () => ({
    spacing: { xs: 4, sm: 8, md: 16 },
    colors: {
      surface: { primary: '#FFFFFF' },
      text: { primary: '#000000', secondary: '#666666', tertiary: '#999999' },
      border: { light: '#E0E0E0' },
      success: '#00FF00',
      warning: '#FFA500',
    },
    layout: {
      borderRadius: { base: 8, md: 6 },
      shadow: { base: {} },
    },
  }),
}));

jest.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    state: { language: 'en', useArabicNumerals: false },
  }),
}));

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    isRTL: false,
  }),
}));

jest.mock('../../utils/styleUtils', () => ({
  textStyles: {
    subtitle: { fontSize: 16, fontWeight: '600' },
    body: { fontSize: 14, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '400' },
  },
}));

jest.mock('../../utils', () => ({
  convertToArabicNumerals: (text: string) => text,
}));

jest.mock('../../components/TaskActions', () => {
  const MockTaskActions = () => <div>Actions</div>;
  return MockTaskActions;
});

// Mock React Native's Animated for performance tests
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      Value: jest.fn(() => ({ interpolate: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn() })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      View: RN.View,
    },
    I18nManager: { isRTL: false },
  };
});

describe('Rendering Performance Tests', () => {
  const createMockTask = (id: number): Task => ({
    id,
    name: `Performance Test Task ${id}`,
    startSlot: (id * 2) % 24,
    duration: 1 + (id % 3),
    completed: id % 2 === 0,
    color: `#${((id * 123456) % 16777216).toString(16).padStart(6, '0')}`,
  });

  describe('Single Task Rendering', () => {
    it('should render a single TaskCard within performance threshold', () => {
      const task = createMockTask(1);
      const startTime = performance.now();
      
      const { getByText } = render(
        <TaskCard task={task} onPress={jest.fn()} />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(getByText('Performance Test Task 1')).toBeTruthy();
      expect(renderTime).toBeLessThan(50); // Should render in less than 50ms
    });
  });

  describe('Multiple Tasks Rendering', () => {
    it('should render 10 TaskCards within performance threshold', () => {
      const tasks = Array.from({ length: 10 }, (_, i) => createMockTask(i + 1));
      const startTime = performance.now();
      
      const results = tasks.map(task =>
        render(<TaskCard key={task.id} task={task} onPress={jest.fn()} />)
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Verify all tasks rendered
      results.forEach((result, index) => {
        expect(result.getByText(`Performance Test Task ${index + 1}`)).toBeTruthy();
      });
      
      expect(renderTime).toBeLessThan(200); // Should render 10 tasks in less than 200ms
      expect(renderTime / tasks.length).toBeLessThan(20); // Average less than 20ms per task
    });

    it('should render 50 TaskCards within performance threshold', () => {
      const tasks = Array.from({ length: 50 }, (_, i) => createMockTask(i + 1));
      const startTime = performance.now();
      
      const results = tasks.map(task =>
        render(<TaskCard key={task.id} task={task} onPress={jest.fn()} />)
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Spot check a few tasks
      expect(results[0].getByText('Performance Test Task 1')).toBeTruthy();
      expect(results[25].getByText('Performance Test Task 26')).toBeTruthy();
      expect(results[49].getByText('Performance Test Task 50')).toBeTruthy();
      
      expect(renderTime).toBeLessThan(1000); // Should render 50 tasks in less than 1 second
      expect(renderTime / tasks.length).toBeLessThan(20); // Average less than 20ms per task
    });
  });

  describe('Memory Usage', () => {
    it('should not create excessive objects during rendering', () => {
      const task = createMockTask(1);
      
      // Monitor garbage collection if available
      const initialMemory = process.memoryUsage?.() || { heapUsed: 0 };
      
      // Render many components
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(
          <TaskCard task={createMockTask(i)} onPress={jest.fn()} />
        );
        unmount();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage?.() || { heapUsed: 0 };
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 10MB for 100 components)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Animation Performance', () => {
    it('should initialize animations efficiently', () => {
      const task = createMockTask(1);
      const startTime = performance.now();
      
      // Render component with animations
      render(<TaskCard task={task} onPress={jest.fn()} />);
      
      const endTime = performance.now();
      const initTime = endTime - startTime;
      
      // Animation initialization should be fast
      expect(initTime).toBeLessThan(10); // Less than 10ms for animation setup
    });
  });

  describe('Task Variety Performance', () => {
    it('should render tasks with different properties efficiently', () => {
      // Create tasks with various properties to test different code paths
      const tasks: Task[] = [
        { id: 1, name: 'Short', startSlot: 0, duration: 1, completed: false, color: '#FF0000' },
        { id: 2, name: 'Very Long Task Name That Should Be Truncated', startSlot: 5, duration: 8, completed: true, color: '#00FF00' },
        { id: 3, name: 'Arabic Task اختبار', startSlot: 15, duration: 2, completed: false, color: '#0000FF' },
        { id: 4, name: 'Special chars !@#$%^&*()', startSlot: 20, duration: 4, completed: true, color: '#FFFF00' },
        { id: 5, name: '', startSlot: 23, duration: 1, completed: false, color: '#FF00FF' }, // Edge case: empty name
      ];
      
      const startTime = performance.now();
      
      const results = tasks.map(task => {
        try {
          return render(<TaskCard key={task.id} task={task} onPress={jest.fn()} />);
        } catch (error) {
          // Handle potential rendering errors gracefully
          return null;
        }
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should handle various task types without significant performance impact
      expect(renderTime).toBeLessThan(100);
      
      // Verify successful renders
      const successfulRenders = results.filter(Boolean);
      expect(successfulRenders.length).toBeGreaterThanOrEqual(4); // At least 4 should render successfully
    });
  });

  describe('Re-render Performance', () => {
    it('should handle prop updates efficiently', () => {
      const initialTask = createMockTask(1);
      let renderCount = 0;
      
      const TestComponent = ({ task }: { task: Task }) => {
        renderCount++;
        return <TaskCard task={task} onPress={jest.fn()} />;
      };
      
      const { rerender } = render(<TestComponent task={initialTask} />);
      
      const startTime = performance.now();
      
      // Simulate multiple prop updates
      for (let i = 0; i < 10; i++) {
        const updatedTask = { ...initialTask, name: `Updated Task ${i}` };
        rerender(<TestComponent task={updatedTask} />);
      }
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      // Re-renders should be efficient
      expect(updateTime).toBeLessThan(50); // Less than 50ms for 10 updates
      expect(updateTime / 10).toBeLessThan(5); // Less than 5ms per update
      expect(renderCount).toBe(11); // Initial render + 10 updates
    });
  });

  describe('Stress Testing', () => {
    // This test is marked as skipped by default to avoid slowing down regular test runs
    it.skip('should handle extreme task loads (stress test)', () => {
      const taskCount = 1000;
      const tasks = Array.from({ length: taskCount }, (_, i) => createMockTask(i + 1));
      
      const startTime = performance.now();
      
      // This would be too slow for regular testing, but useful for performance analysis
      const results = tasks.map(task =>
        render(<TaskCard key={task.id} task={task} onPress={jest.fn()} />)
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`Rendered ${taskCount} tasks in ${renderTime}ms`);
      console.log(`Average time per task: ${renderTime / taskCount}ms`);
      
      // Even with 1000 tasks, should complete in reasonable time
      expect(renderTime).toBeLessThan(10000); // Less than 10 seconds
      
      // Cleanup
      results.forEach(result => result.unmount?.());
    });
  });
});