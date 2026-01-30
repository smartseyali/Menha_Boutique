import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ImageBackground, Image, StatusBar } from 'react-native';
import api, { setAuthToken } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEME } from '../constants/theme';

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
      await AsyncStorage.setItem('user_info', JSON.stringify(user));
      
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
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ImageBackground 
        source={require('../../assets/login_bg.jpg')} 
        style={styles.backgroundImage}
      >
        <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={styles.overlay}
        >
            <View style={styles.formContainer}>
                <Text style={styles.title}>Menha Boutique</Text>
                <Text style={styles.subtitle}>Welcome Back!</Text>

                <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email or Phone Number"
                        placeholderTextColor="#999"
                        value={identifier}
                        onChangeText={setIdentifier}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity 
                    onPress={handleLogin} 
                    disabled={loading}
                    style={styles.loginBtnContainer}
                >
                    <LinearGradient
                        colors={THEME.gradients.primary as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkHighlight}>Sign Up</Text></Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
      marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#eee',
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.8,
  },
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 12,
      marginBottom: 15,
      paddingHorizontal: 15,
      height: 55,
  },
  inputIcon: {
      marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
    fontSize: 16,
  },
  loginBtnContainer: {
      marginTop: 20,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
  },
  button: {
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  linkButton: {
    marginTop: 25,
    alignItems: 'center',
  },
  linkText: {
    color: '#fff',
    fontSize: 14,
  },
  linkHighlight: {
      fontWeight: 'bold',
      color: COLORS.primary,
  }
});

export default LoginScreen;
