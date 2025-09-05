import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from './Button';

// Mock the constants
jest.mock('../constants', () => ({
  COLORS: {
    primary: '#007AFF',
    textSecondary: '#666666',
  },
  LAYOUT: {
    padding: 12,
    borderRadius: 8,
  },
}));

describe('Button', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should render with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />
    );

    const button = getByText('Test Button').parent?.parent;
    expect(button?.props.disabled).toBe(true);
  });

  it('should not call onPress when disabled', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should apply disabled styles when disabled', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />
    );

    const button = getByText('Test Button').parent?.parent;
    expect(button?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#007AFF', // primary color
        }),
        expect.objectContaining({
          backgroundColor: '#666666', // textSecondary color
        }),
      ])
    );
  });

  it('should apply disabled text styles when disabled', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />
    );

    const text = getByText('Test Button');
    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '600',
        }),
        expect.objectContaining({
          color: '#CCCCCC',
        }),
      ])
    );
  });

  it('should use default disabled value as false', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );

    const button = getByText('Test Button').parent?.parent;
    expect(button?.props.disabled).toBe(false);
  });

  it('should apply correct default styles', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );

    const button = getByText('Test Button').parent?.parent;
    const text = getByText('Test Button');

    expect(button?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#007AFF',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }),
      ])
    );

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '600',
        }),
      ])
    );
  });
});