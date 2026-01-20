import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Determine API URL based on platform
const getBaseUrl = () => {
    return 'https://menhaapi.smartseyali.app/api';
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
