import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';

// Replace YOUR_BACKEND_IP with your actual local IP (e.g. 192.168.x.x) where FastAPI runs
// Do NOT use localhost here if running on a physical Android device or emulator!
const API_BASE_URL = 'http://192.168.137.178:8000/api';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing Fields", "Please enter both ID/Email and Password.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, { username, password });
      
      if (res.data.status === 'success' && res.data.user.role === 'worker') {
        const workerUser = {
          id: res.data.user.id,
          username: res.data.user.username,
          password: password // Keep it to sign requests later
        };
        onLogin(workerUser);
      } else {
        Alert.alert('Access Denied', 'This app is for Municipal Field Workers only.');
      }
    } catch (err) {
      console.error(err);
      // For Demo: if backend not reachable, simulate local offline login if it looks like a test user
      if (username === 'worker_101') {
        Alert.alert('Offline Demo Mode', 'Backend unreachable. Proceeding with local offline login for worker_101.');
        onLogin({ id: 101, username: 'worker_101', password: password });
      } else {
        Alert.alert('Login Failed', 'Invalid credentials or network error. (Ensure YOUR_BACKEND_IP is correct).');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!username) {
      Alert.alert("Missing Email", "Please enter your Email in the username box to receive a reset link.");
      return;
    }

    setLoading(true);
    try {
      // In this case, 'username' state holds the user's email input
      const res = await axios.post(`${API_BASE_URL}/forgot-password`, { email: username });
      Alert.alert('Reset Link Sent!', res.data.message);
      setForgotMode(false);
    } catch (err) {
      console.error(err);
      Alert.alert('Network Error', 'Ensure backend is running and YOUR_BACKEND_IP is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Worker Login</Text>
      
      {forgotMode ? (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Enter your registered email below to receive a password reset link.</Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleForgotPassword} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setForgotMode(false)}>
            <Text style={styles.secondaryText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Enter your credentials to begin tracking.</Text>
          <TextInput
            style={styles.input}
            placeholder="Worker ID or Email (worker_101)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Start Shift</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setForgotMode(true)}>
            <Text style={styles.secondaryText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 250,
    height: 120,
    alignSelf: 'center',
    marginBottom: 30,
  },
  card: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  subtitle: {
    marginBottom: 20,
    color: '#666',
    textAlign: 'center'
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16
  },
  primaryButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 10,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '500'
  }
});

export default LoginScreen;
