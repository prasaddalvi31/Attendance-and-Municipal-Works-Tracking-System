import * as Location from 'expo-location';

export const getCurrentLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied');
  }

  // Uses highest accuracy for precise attendance tracking
  let location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Highest,
  });
  
  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    timestamp: location.timestamp
  };
};