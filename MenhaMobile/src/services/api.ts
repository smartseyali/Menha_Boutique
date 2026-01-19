import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Determine API URL based on platform
const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5000/api'; // Android Emulator
    } else if (Platform.OS === 'web') {
        return 'http://localhost:5000/api'; // Web Browser
    } else {
        return 'http://localhost:5000/api'; // iOS Simulator
    }
};

const API_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
