import numpy as np
from sklearn.cluster import KMeans
from typing import List, Dict

class HotspotPredictor:
    def __init__(self, n_clusters=3):
        self.n_clusters = n_clusters
        self.model = KMeans(n_clusters=self.n_clusters, random_state=42, n_init='auto')

    def predict_risk_zones(self, reports: List[Dict]) -> List[Dict]:
        """
        Input: List of dicts with 'latitude', 'longitude'.
        Output: List of risk zones (lat, lng, radius).
        """
        if len(reports) < self.n_clusters:
            # Not enough data for clustering
            return []

        # Extract coordinates
        coords = np.array([[r['latitude'], r['longitude']] for r in reports])

        # Fit Model
        self.model.fit(coords)
        
        # Get Centers
        centers = self.model.cluster_centers_

        # Calculate a simple "radius" or impact score based on point density
        # For simplicity, we'll return fixed radius for now, or dynamic if we had time.
        risk_zones = []
        for center in centers:
            risk_zones.append({
                "latitude": center[0],
                "longitude": center[1],
                "risk_score": 0.8, # Mock score (0-1)
                "radius": 500 # meters (visualization)
            })

        return risk_zones

hotspot_predictor = HotspotPredictor()
