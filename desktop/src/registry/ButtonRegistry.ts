export interface RegistryComponent {
  name: string;
  template: string;
}

export class ButtonRegistry {
  private static buttons: Record<string, string> = {
    PrimaryButton: `
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const PrimaryButton = ({ title, onPress, disabled }) => (
  <TouchableOpacity 
    style={[styles.button, disabled && styles.disabled]} 
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
`,
    SecondaryButton: `
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const SecondaryButton = ({ title, onPress, disabled }) => (
  <TouchableOpacity 
    style={[styles.button, disabled && styles.disabled]} 
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
`
  };

  static get(componentName: string): string {
    return this.buttons[componentName] || this.buttons['PrimaryButton'];
  }
}
