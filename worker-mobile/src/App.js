import React, { useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import TaskDashboard from './screens/TaskDashboard';
import LoginScreen from './screens/LoginScreen';

export default function App() {
  const [worker, setWorker] = useState(null);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {worker ? (
          <TaskDashboard worker={worker} />
        ) : (
          <LoginScreen onLogin={setWorker} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});