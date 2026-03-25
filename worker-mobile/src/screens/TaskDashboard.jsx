import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, Image, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { getCurrentLocation } from '../services/locationService';
import { saveLogLocally, syncOfflineLogs } from '../database/offlineSync';
import axios from 'axios';

const TaskDashboard = ({ worker }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const cameraRef = useRef(null);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await axios.get('http://192.168.137.178:8000/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      syncOfflineLogs();
      fetchTasks();
    })();
  }, []);

  const handleCaptureAndLog = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 1. Capture precise GPS coordinates 
      const location = await getCurrentLocation();
      
      // 2. Capture Photo (simulated processing for brevity)
      let photo = null;
      if (cameraRef.current) {
        photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      }

      const formData = new FormData();
      formData.append('worker_id', worker.id);
      formData.append('password', worker.password || '');
      formData.append('lat', location.lat);
      formData.append('lng', location.lng);
      formData.append('timestamp', new Date().toISOString());
      if (selectedTask) {
        formData.append('task_id', selectedTask.id);
      }
      
      if (photo && photo.uri) {
        const ext = photo.uri.split('.').pop() || 'jpg';
        formData.append('photo', {
          uri: photo.uri,
          name: `photo.${ext}`,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`
        });
      }

      // 3. Attempt network request, fallback to offline cache [cite: 44, 45]
      try {
        await axios.post('http://192.168.137.178:8000/api/track', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Alert.alert("Success", selectedTask ? "Task marked completed." : "Attendance and task verified.");
        setSelectedTask(null);
        fetchTasks();
      } catch (networkError) {
        // We save the original plain object locally so we can recreate FormData on sync
        const offlineData = { worker_id: worker.id, password: worker.password, lat: location.lat, lng: location.lng, photo_uri: photo ? photo.uri : null, task_id: selectedTask ? selectedTask.id : null };
        await saveLogLocally(offlineData);
        Alert.alert("Offline Mode", "Saved locally. Will sync when connection is restored.");
      }

    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  if (!selectedTask) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pending Assignments</Text>
          <TouchableOpacity onPress={fetchTasks}>
            <Text style={styles.refreshText}>↻ Refresh</Text>
          </TouchableOpacity>
        </View>

        {loadingTasks ? (
          <ActivityIndicator size="large" color="#0056b3" style={{ marginTop: 50 }} />
        ) : tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending tasks!</Text>
            <TouchableOpacity style={[styles.captureButton, { marginTop: 20 }]} onPress={() => setSelectedTask('general')}>
              <Text style={styles.buttonText}>Log General Patrol</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ padding: 15 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.taskCard} onPress={() => setSelectedTask(item)}>
                {item.photo_url && (
                  <Image source={{ uri: `http://192.168.137.178:8000/${item.photo_url}` }} style={styles.taskImage} />
                )}
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>Worksite Assessment #{item.id}</Text>
                  <Text style={styles.taskDesc}>Location: {item.lat.toFixed(3)}, {item.lng.toFixed(3)}</Text>
                  <Text style={styles.taskCrew}>Requires: {item.estimated_workers} workers</Text>
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={() => (
               <TouchableOpacity style={[styles.captureButton, { marginTop: 20 }]} onPress={() => setSelectedTask('general')}>
                <Text style={styles.buttonText}>Log General Patrol</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef} />
      
      <TouchableOpacity style={styles.backButton} onPress={() => setSelectedTask(null)}>
        <Text style={styles.backButtonText}>← Cancel</Text>
      </TouchableOpacity>

      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.captureButton} 
          onPress={handleCaptureAndLog}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? "Processing..." : (selectedTask === 'general' ? "Log Patrol Proof" : "Submit Repair Proof")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    backgroundColor: '#0056b3',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshText: {
    color: '#0056b3',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  taskImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 15,
  },
  taskInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskCrew: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default TaskDashboard;