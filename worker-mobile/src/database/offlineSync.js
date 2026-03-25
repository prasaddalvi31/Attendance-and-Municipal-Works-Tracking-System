import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const STORAGE_KEY = '@neurax_offline_logs';
const API_URL = 'http://192.168.137.178:8000/api/track'; // Replace with actual backend IP or AWS URL

export const saveLogLocally = async (logData) => {
  try {
    const existingLogs = await AsyncStorage.getItem(STORAGE_KEY);
    let logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(logData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    console.log('Log saved locally for offline sync.');
  } catch (error) {
    console.error('Error saving offline log:', error);
  }
};

export const syncOfflineLogs = async () => {
  try {
    const existingLogs = await AsyncStorage.getItem(STORAGE_KEY);
    if (!existingLogs) return;

    const logs = JSON.parse(existingLogs);
    if (logs.length === 0) return;

    console.log(`Attempting to sync ${logs.length} logs...`);

    // Attempt to send cached logs to the backend
    for (let i = 0; i < logs.length; i++) {
      await axios.post(API_URL, logs[i]);
    }

    // Clear local storage after successful sync
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('Offline logs successfully synced to database.');
  } catch (error) {
    console.error('Sync failed, will retry later:', error);
  }
};