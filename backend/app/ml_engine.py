import numpy as np
import os
import random
from sklearn.ensemble import IsolationForest

class MLEngine:
    def __init__(self):
        # Isolation Forest is great for outlier/anomaly detection in spatial data
        self.anomaly_model = IsolationForest(contamination=0.05, random_state=42)
        self.is_trained = False

    def train_anomaly_model(self, historical_gps_data):
        """
        historical_gps_data: list of [latitude, longitude] arrays representing normal routes.
        """
        if len(historical_gps_data) > 10:
            self.anomaly_model.fit(historical_gps_data)
            self.is_trained = True

    def detect_anomaly(self, lat: float, lng: float):
        """
        Proactively flags suspicious deviations. Returns True if anomaly detected.
        """
        if not self.is_trained:
            return False # Default to normal if not enough data
        
        prediction = self.anomaly_model.predict([[lat, lng]])
        # IsolationForest returns -1 for outliers and 1 for inliers
        return prediction[0] == -1

    def estimate_workforce_needed(self, photo_path: str, lat: float, lng: float) -> int:
        """
        AI Heuristic to estimate the number of workers required for a municipal repair.
        For demonstration, we use a deterministic hash of the file size and coordinates 
        to simulate a complex Deep Learning analysis of the image damage spread.
        """
        try:
            file_size = os.path.getsize(photo_path)
        except:
            file_size = random.randint(1000, 500000)
            
        # Create a pseudo-random seed based on inputs to keep the AI "consistent"
        seed_val = int(file_size + abs(lat * 100) + abs(lng * 100))
        random.seed(seed_val)
        
        # We assume larger files mean more complex scenes, but bound the workers between 1 and 8
        base_workers = random.randint(1, 5)
        if file_size > 2 * 1024 * 1024:  # > 2MB (high detail/damage spread)
            base_workers += random.randint(1, 3)
            
        return min(base_workers, 8)

ml_engine = MLEngine()