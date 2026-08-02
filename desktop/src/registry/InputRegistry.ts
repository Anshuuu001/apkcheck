export class InputRegistry {
  private static inputs: Record<string, string> = {
    TextInputField: `
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export const TextInputField = ({ label, placeholder, value, onChangeText, secureTextEntry }) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  }
});
`
  };

  static get(componentName: string): string {
    return this.inputs[componentName] || this.inputs['TextInputField'];
  }
}
