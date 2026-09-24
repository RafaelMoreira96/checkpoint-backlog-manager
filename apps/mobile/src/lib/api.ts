import { CheckpointApiClient, StorageAdapter } from '@checkpoint/core';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const secureStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (err) {
      console.error('Failed to set secure item:', err);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (err) {
      console.error('Failed to remove secure item:', err);
    }
  },
};

// Android emulator uses 10.0.2.2, iOS simulator uses localhost
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080/api/v1';
    }
    return 'http://localhost:8080/api/v1';
  }
  return 'https://api.checkpoint.app/api/v1';
};

export const mobileApi = new CheckpointApiClient({
  baseUrl: getBaseUrl(),
  storage: secureStorageAdapter,
});
