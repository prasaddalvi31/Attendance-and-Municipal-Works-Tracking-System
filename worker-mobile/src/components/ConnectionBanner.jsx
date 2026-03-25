import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ConnectionBanner = ({ isOffline, cachedLogsCount }) => {
  if (!isOffline && cachedLogsCount === 0) return null;

  return (
    <View style={[styles.banner, isOffline ? styles.offlineBg : styles.syncingBg]}>
      <Text style={styles.text}>
        {isOffline 
          ? `Offline Mode Active. ${cachedLogsCount} tasks cached.` 
          : `Syncing ${cachedLogsCount} tasks to database...`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineBg: {
    backgroundColor: '#ff9800', // Warning Orange
  },
  syncingBg: {
    backgroundColor: '#4caf50', // Success Green
  },
  text: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  }
});

export default ConnectionBanner;    