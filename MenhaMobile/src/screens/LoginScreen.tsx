import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api, { setAuthToken } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ route }: any) => {
  const { setIsAuthenticated } = route.params || {};
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter both email/phone and password');
      return;
    }

    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const payload = {
        password,
        ...(isEmail ? { email: identifier } : { phoneNumber: identifier })
      };
      
      const response = await api.post('/auth/login', payload);
      const { token, user } = response.data;

      setAuthToken(token);
      await AsyncStorage.setItem('auth_token', token);
      
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }
      
      // Handle Redirect Logic
      const { redirect, cartItems, totalAmount } = route.params || {};
      if (redirect === 'Checkout') {
          // Pass the cart params back to checkout
          navigation.replace('Checkout', { cartItems, totalAmount });
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainTabs'); 
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menha Boutique</Text>
      <Text style={styles.subtitle}>Sign in to start ordering</Text>

      <TextInput
        style={styles.input}
        placeholder="Email or Phone Number"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
  },
});

export default LoginScreen;
