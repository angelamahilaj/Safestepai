import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import Colors from '@/constants/colors';
import { ReactNode } from 'react';

type AccessibleButtonProps = {
  onPress: () => void;
  title: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'emergency';
  style?: ViewStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export default function AccessibleButton({
  onPress,
  title,
  icon,
  variant = 'primary',
  style,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: AccessibleButtonProps) {
  const { announceAndVibrate } = useAccessibility();

  const handlePress = () => {
    if (disabled) return;
    
    announceAndVibrate(title, variant === 'emergency' ? 'warning' : 'medium');
    onPress();
  };

  const buttonStyles: ViewStyle[] = [
    styles.button,
    variant === 'primary' && styles.primaryButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'emergency' && styles.emergencyButton,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    variant === 'emergency' && styles.emergencyText,
    disabled && styles.disabledText,
  ];

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        ...buttonStyles,
        pressed && styles.pressed,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      {icon}
      <Text style={textStyles}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.blue,
  },
  secondaryButton: {
    backgroundColor: Colors.darkBlue,
  },
  emergencyButton: {
    backgroundColor: Colors.red,
  },
  disabledButton: {
    backgroundColor: Colors.gray,
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  text: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  emergencyText: {
    fontSize: 28,
    fontWeight: '900' as const,
  },
  disabledText: {
    color: Colors.lightGray,
  },
});
