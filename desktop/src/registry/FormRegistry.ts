/**
 * FormRegistry — Pre-built form templates for common use cases.
 * All forms use React Hook Form-compatible patterns and include
 * validation, loading states, and proper keyboard handling.
 */
export class FormRegistry {
  private static forms: Record<string, string> = {

    LoginForm: `
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { EmailField } from '../components/EmailField';
import { PasswordField } from '../components/PasswordField';
import { PrimaryButton } from '../components/PrimaryButton';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onForgotPassword?: () => void;
  onRegister?: () => void;
  appName?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onForgotPassword, onRegister, appName = 'AppForge' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try { await onSubmit(email, password); }
    catch (err) { setErrors({ email: 'Invalid email or password' }); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Welcome to {appName}</Text>
        <Text style={styles.subheading}>Sign in to continue</Text>
        <EmailField value={email} onChangeText={setEmail} error={errors.email} />
        <PasswordField value={password} onChangeText={setPassword} error={errors.password} />
        <TouchableOpacity onPress={onForgotPassword} style={styles.forgotRow}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
        <PrimaryButton title="Sign In" onPress={handleSubmit} loading={loading} />
        {onRegister && (
          <TouchableOpacity onPress={onRegister} style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? <Text style={styles.link}>Sign Up</Text></Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  heading: { fontSize: 28, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  subheading: { fontSize: 15, color: '#64748b', marginBottom: 32 },
  forgotRow: { alignItems: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 14, color: '#3b82f6', fontWeight: '600' },
  registerRow: { marginTop: 20, alignItems: 'center' },
  registerText: { fontSize: 14, color: '#64748b' },
  link: { color: '#3b82f6', fontWeight: '700' },
});
`,

    RegisterForm: `
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextField } from '../components/TextField';
import { EmailField } from '../components/EmailField';
import { PasswordField } from '../components/PasswordField';
import { PhoneField } from '../components/PhoneField';
import { PrimaryButton } from '../components/PrimaryButton';

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<void>;
  onLogin?: () => void;
  roles?: string[];
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, onLogin, roles = ['User'] }) => {
  const [data, setData] = useState<RegisterData>({ name: '', email: '', phone: '', password: '', role: roles[0] });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData>>({});

  const validate = () => {
    const e: Partial<RegisterData> = {};
    if (!data.name) e.name = 'Name is required';
    if (!data.email) e.email = 'Email is required';
    if (!data.phone || data.phone.length < 10) e.phone = 'Valid phone number required';
    if (data.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try { await onSubmit(data); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subheading}>Join us today</Text>
        <TextField label="Full Name" value={data.name} onChangeText={v => setData({ ...data, name: v })} placeholder="John Doe" error={errors.name} />
        <EmailField value={data.email} onChangeText={v => setData({ ...data, email: v })} error={errors.email} />
        <PhoneField value={data.phone} onChangeText={v => setData({ ...data, phone: v })} error={errors.phone} />
        <PasswordField value={data.password} onChangeText={v => setData({ ...data, password: v })} error={errors.password} />
        <PrimaryButton title="Create Account" onPress={handleSubmit} loading={loading} />
        {onLogin && (
          <TouchableOpacity onPress={onLogin} style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.link}>Sign In</Text></Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24 },
  heading: { fontSize: 28, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  subheading: { fontSize: 15, color: '#64748b', marginBottom: 28 },
  loginRow: { marginTop: 20, alignItems: 'center' },
  loginText: { fontSize: 14, color: '#64748b' },
  link: { color: '#3b82f6', fontWeight: '700' },
});
`,

    SearchFilterForm: `
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SearchBar } from '../components/SearchBar';

interface SearchFilterFormProps {
  filters: string[];
  onSearch: (query: string, filter: string) => void;
  placeholder?: string;
}

export const SearchFilterForm: React.FC<SearchFilterFormProps> = ({ filters, onSearch, placeholder = 'Search...' }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(filters[0] ?? 'All');

  const handleSearch = (q: string) => {
    setQuery(q);
    onSearch(q, activeFilter);
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    onSearch(query, filter);
  };

  return (
    <View style={styles.container}>
      <SearchBar value={query} onChangeText={handleSearch} placeholder={placeholder} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => handleFilter(f)}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12 },
  filterRow: { marginTop: 12 },
  filterContent: { paddingBottom: 4, gap: 8, flexDirection: 'row' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8 },
  chipActive: { backgroundColor: '#3b82f6' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#ffffff' },
});
`,
  };

  static get(formName: string): string {
    return this.forms[formName] ?? this.forms['LoginForm'];
  }

  static getAll(): Record<string, string> {
    return { ...this.forms };
  }

  static list(): string[] {
    return Object.keys(this.forms);
  }
}
