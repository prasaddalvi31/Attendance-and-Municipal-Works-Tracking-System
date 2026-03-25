import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GpsStatusLabel = ({ isActive, latitude, longitude }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.indicator, isActive ? styles.active : styles.inactive]} />
      <Text style={styles.statusText}>
        {isActive && latitude && longitude
          ? `GPS Active: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          : 'Acquiring GPS Signal...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  active: {
    backgroundColor: '#4caf50', // Green
  },
  inactive: {
    backgroundColor: '#f44336', // Red
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  }
});

export default GpsStatusLabel;