export class ScreenRegistry {
  private static screens: Record<string, string> = {
    DashboardScreen: `
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Overview</Text>
        <Text style={styles.subtitle}>Welcome back to your AppForge App</Text>
      </View>
      
      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardVal}>12</Text>
          <Text style={styles.cardLbl}>Active Slots</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardVal}>84%</Text>
          <Text style={styles.cardLbl}>Completion Rate</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cardVal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  cardLbl: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  }
});
`,
    LoginScreen: `
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInputField } from '../components/TextInputField';
import { PrimaryButton } from '../components/PrimaryButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login initiated:', email);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to manage your records</Text>

        <TextInputField
          label="Email Address"
          placeholder="name@hospital.com"
          value={email}
          onChangeText={setEmail}
        />
        <TextInputField
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <PrimaryButton title="Sign In" onPress={handleLogin} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  }
});
`
  };

  static get(screenName: string): string {
    if (screenName.toLowerCase().includes('login') || screenName.toLowerCase().includes('auth')) {
      return this.screens['LoginScreen'];
    }
    return this.screens['DashboardScreen'];
  }
}
