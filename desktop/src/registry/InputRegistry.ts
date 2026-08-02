export class InputRegistry {
  private static inputs: Record<string, string> = {

    TextField: `
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  style?: ViewStyle;
}

export const TextField: React.FC<TextFieldProps> = ({ label, value, onChangeText, placeholder, error, style }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10,
    padding: 14, fontSize: 15, color: '#1e293b', backgroundColor: '#f8fafc',
  },
  inputFocused: { borderColor: '#3b82f6', backgroundColor: '#fff' },
  inputError: { borderColor: '#ef4444' },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
});
`,

    EmailField: `
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';

interface EmailFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  style?: ViewStyle;
}

export const EmailField: React.FC<EmailFieldProps> = ({ label = 'Email Address', value, onChangeText, error, style }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder="you@example.com"
        placeholderTextColor="#94a3b8"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10,
    padding: 14, fontSize: 15, color: '#1e293b', backgroundColor: '#f8fafc',
  },
  inputFocused: { borderColor: '#3b82f6', backgroundColor: '#fff' },
  inputError: { borderColor: '#ef4444' },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
});
`,

    PasswordField: `
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface PasswordFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  style?: ViewStyle;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ label = 'Password', value, onChangeText, error, style }) => {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, focused && styles.rowFocused, error && styles.rowError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          secureTextEntry={!visible}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.toggle}>
          <Text style={styles.toggleText}>{visible ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  row: {
    flexDirection: 'row', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 10, backgroundColor: '#f8fafc', alignItems: 'center',
  },
  rowFocused: { borderColor: '#3b82f6', backgroundColor: '#fff' },
  rowError: { borderColor: '#ef4444' },
  input: { flex: 1, padding: 14, fontSize: 15, color: '#1e293b' },
  toggle: { paddingHorizontal: 14 },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#3b82f6' },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
});
`,

    PhoneField: `
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';

interface PhoneFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  style?: ViewStyle;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({ label = 'Phone Number', value, onChangeText, error, style }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, focused && styles.rowFocused, error && styles.rowError]}>
        <Text style={styles.prefix}>+91</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="98765 43210"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          maxLength={10}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  row: {
    flexDirection: 'row', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 10, backgroundColor: '#f8fafc', alignItems: 'center',
  },
  rowFocused: { borderColor: '#3b82f6', backgroundColor: '#fff' },
  rowError: { borderColor: '#ef4444' },
  prefix: { paddingHorizontal: 14, fontSize: 15, color: '#374151', fontWeight: '600', borderRightWidth: 1, borderRightColor: '#e2e8f0', paddingVertical: 14 },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: '#1e293b' },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
});
`,

    OTPField: `
import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface OTPFieldProps {
  length?: number;
  onComplete: (otp: string) => void;
}

export const OTPField: React.FC<OTPFieldProps> = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < length - 1) refs.current[index + 1]?.focus();
    if (newOtp.every(c => c !== '')) onComplete(newOtp.join(''));
  };

  return (
    <View style={styles.row}>
      {otp.map((val, i) => (
        <TextInput
          key={i}
          ref={r => { refs.current[i] = r; }}
          style={[styles.box, val ? styles.boxFilled : null]}
          value={val}
          onChangeText={text => handleChange(text.slice(-1), i)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  box: {
    width: 48, height: 56, borderRadius: 10, borderWidth: 1.5,
    borderColor: '#e2e8f0', textAlign: 'center', fontSize: 22,
    fontWeight: '700', color: '#1e293b', backgroundColor: '#f8fafc',
  },
  boxFilled: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
});
`,

    SearchBar: `
import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, placeholder = 'Search...', style }) => (
  <View style={[styles.container, style]}>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      returnKeyType="search"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { flex: 1, fontSize: 15, color: '#1e293b', paddingVertical: 12 },
});
`,

    TextAreaField: `
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  error?: string;
  style?: ViewStyle;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, value, onChangeText, placeholder, rows = 4, maxLength, error, style }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, { height: rows * 24 }, focused && styles.inputFocused, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        multiline
        numberOfLines={rows}
        maxLength={maxLength}
        textAlignVertical="top"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {maxLength && <Text style={styles.count}>{value.length}/{maxLength}</Text>}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10,
    padding: 14, fontSize: 15, color: '#1e293b', backgroundColor: '#f8fafc',
  },
  inputFocused: { borderColor: '#3b82f6', backgroundColor: '#fff' },
  inputError: { borderColor: '#ef4444' },
  count: { fontSize: 12, color: '#94a3b8', textAlign: 'right', marginTop: 4 },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
});
`,

    TextInputField: `
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export const TextInputField = ({ label, value, onChangeText, placeholder, error }: any) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, focused && styles.focused, error && styles.error]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 15, color: '#1e293b', backgroundColor: '#f8fafc' },
  focused: { borderColor: '#3b82f6' },
  error: { borderColor: '#ef4444' },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 4 },
});
`,
  };

  static get(componentName: string): string {
    return this.inputs[componentName] ?? this.inputs['TextField'];
  }

  static getAll(): Record<string, string> {
    return { ...this.inputs };
  }

  static list(): string[] {
    return Object.keys(this.inputs);
  }
}
