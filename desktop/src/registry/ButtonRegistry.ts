export interface RegistryComponent {
  name: string;
  template: string;
}

export class ButtonRegistry {
  private static buttons: Record<string, string> = {

    PrimaryButton: `
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, disabled, loading, style }) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color="#ffffff" size="small" />
    ) : (
      <Text style={styles.text}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: { opacity: 0.5, shadowOpacity: 0 },
  text: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
`,

    SecondaryButton: `
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ title, onPress, disabled, loading, style }) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color="#3b82f6" size="small" />
    ) : (
      <Text style={styles.text}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  text: { color: '#3b82f6', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
});
`,

    IconButton: `
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onPress, size = 48, backgroundColor = '#f1f5f9', style }) => (
  <TouchableOpacity
    style={[styles.button, { width: size, height: size, borderRadius: size / 2, backgroundColor }, style]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {icon}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
`,

    FABButton: `
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface FABButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
}

const sizeMap = { small: 44, medium: 56, large: 68 };

export const FABButton: React.FC<FABButtonProps> = ({ icon, onPress, size = 'medium', color = '#3b82f6', style }) => {
  const dim = sizeMap[size];
  return (
    <TouchableOpacity
      style={[styles.button, { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: color }, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
});
`,

    GhostButton: `
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface GhostButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}

export const GhostButton: React.FC<GhostButtonProps> = ({ title, onPress, color = '#64748b', style }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.6}>
    <Text style={[styles.text, { color }]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: { paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  text: { fontSize: 15, fontWeight: '500', textDecorationLine: 'underline' },
});
`,

    DangerButton: `
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface DangerButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const DangerButton: React.FC<DangerButtonProps> = ({ title, onPress, disabled, loading, style }) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.text}>{title}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: { opacity: 0.5 },
  text: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
`,
  };

  static get(componentName: string): string {
    return this.buttons[componentName] ?? this.buttons['PrimaryButton'];
  }

  static getAll(): Record<string, string> {
    return { ...this.buttons };
  }

  static list(): string[] {
    return Object.keys(this.buttons);
  }
}
