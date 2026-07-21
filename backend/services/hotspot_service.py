import numpy as np
from sklearn.cluster import KMeans
from typing import List, Dict

class HotspotService:
    def predict_risk_zones(self, reports) -> List[Dict]:
        """
        Input: List of DB Report objects.
        Output: List of hotspots.
        """
        data = [{"latitude": r.latitude, "longitude": r.longitude} for r in reports]
        
        if len(data) < 3:
            return [] # Need at least 3 points for meaningful 3-cluster prediction

        coords = np.array([[d['latitude'], d['longitude']] for d in data])
        
        # Dynamic K based on data size (e.g. 1 cluster per 5 reports, max 5)
        k = min(5, max(1, len(data) // 3))
        
        model = KMeans(n_clusters=k, random_state=42, n_init='auto')
        model.fit(coords)
        centers = model.cluster_centers_

        zones = []
        for center in centers:
            zones.append({
                "latitude": float(center[0]),
                "longitude": float(center[1]),
                "risk_level": "High",
                "radius": 400 
            })
        return zones

hotspot_service = HotspotService()
