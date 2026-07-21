import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon URL resolution
delete L.Icon.Default.prototype._getIconUrl;

// Custom Marker Colors
const highIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const mediumIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const lowIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const resolvedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const getReportMarkerIcon = (report) => {
    if (report.status === 'Resolved') return resolvedIcon;
    if (report.urgency_level === 'High') return highIcon;
    if (report.urgency_level === 'Medium') return mediumIcon;
    return lowIcon;
};

// Map Controller: Handles Flying to locations
const MapController = ({ centerLocation }) => {
    const map = useMap();
    useEffect(() => {
        if (centerLocation) {
            map.flyTo(centerLocation, 16, { animate: true, duration: 1.5 });
        }
    }, [centerLocation, map]);
    return null;
};

// Center Tracker: Tracks movement and updates address
const CenterTracker = ({ onCenterChange }) => {
    const map = useMap();
    useEffect(() => {
        onCenterChange(map.getCenter());
    }, []);

    useMapEvents({
        moveend: () => {
             onCenterChange(map.getCenter());
        }
    });
    return null;
};

const MapView = ({ reports = [], hotspots = [], onReportClick }) => {
    const defaultCenter = [20.5937, 78.9629]; 
    const [mapCenter, setMapCenter] = useState(defaultCenter); 
    const [centerAddress, setCenterAddress] = useState("Move map to select location...");
    const [centerCoords, setCenterCoords] = useState(null);
    const [isResolving, setIsResolving] = useState(false);
    
    // UI Search & Autocomplete States
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Geolocation Logic
    const handleLocateMe = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = [position.coords.latitude, position.coords.longitude];
                setMapCenter(pos); 
            },
            () => alert("Unable to find location. Check GPS permission."),
            { enableHighAccuracy: true }
        );
    };

    useEffect(() => { handleLocateMe(); }, []);

    // Reverse Geocode (Center of Map)
    const handleCenterChange = async (latlng) => {
        setCenterCoords(latlng);
        setIsResolving(true);
        setCenterAddress("Loading address...");
        
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
            const data = await res.json();
            const shortAddr = data.display_name ? data.display_name.split(',').slice(0, 4).join(',') : "Unknown Location";
            setCenterAddress(shortAddr);
        } catch (error) {
            setCenterAddress("Address unavailable");
        } finally {
            setIsResolving(false);
        }
    };

    // Autocomplete Search Logic
    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`);
                const data = await res.json();
                setSearchResults(data || []);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    };

    const selectSearchResult = (result) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        setMapCenter([lat, lon]);
        setSearchResults([]);
        setSearchQuery(result.display_name);
    };

    return (
        <div className="relative w-full h-full rounded-none sm:rounded-xl overflow-hidden border-0 sm:border border-gray-300 shadow-md flex flex-col">
            
            {/* TOP BAR: Search Autocomplete & Geolocation */}
            <div className="absolute top-3 left-3 right-14 sm:top-4 sm:left-4 sm:right-16 z-[1000] flex gap-2">
                <div className="flex-1 flex bg-white/95 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <input 
                        className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm outline-none bg-transparent" 
                        placeholder="🔍 Type city, street or landmark..." 
                        value={searchQuery}
                        onChange={handleSearchInput}
                    />
                    {isSearching && (
                        <div className="flex items-center pr-3">
                            <div className="animate-spin h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent rounded-full" />
                        </div>
                    )}
                </div>
            </div>

            <button 
                onClick={handleLocateMe}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[1000] bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-xl shadow-lg border border-gray-200 hover:bg-blue-50 text-blue-600 font-bold text-sm transition transform hover:scale-105"
                title="Locate Me"
            >
                📍
            </button>

            {/* Autocomplete Dropdown */}
            {searchResults.length > 0 && (
                <div className="absolute top-14 left-3 right-3 sm:top-16 sm:left-4 sm:right-4 z-[1001] bg-white rounded-xl shadow-2xl max-h-56 overflow-y-auto border border-gray-100 divide-y divide-gray-100 animate-fade-in">
                    {searchResults.map((item) => (
                        <div 
                            key={item.place_id}
                            className="px-4 py-3 text-xs hover:bg-blue-50 cursor-pointer text-gray-700 font-medium flex items-center gap-2 transition"
                            onClick={() => selectSearchResult(item)}
                        >
                            <span>📍</span>
                            <span className="truncate">{item.display_name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* MAP CONTAINER */}
            <div className="flex-1 relative">
                <MapContainer 
                    center={defaultCenter} 
                    zoom={5} 
                    className="w-full h-full"
                    zoomControl={false}
                >
                    <TileLayer
                        url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                        attribution='&copy; Google Maps'
                    />
                    
                    <MapController centerLocation={mapCenter} />
                    <CenterTracker onCenterChange={handleCenterChange} />

                    {/* Color-Coded Report Markers */}
                    {reports.map((report) => (
                        <Marker 
                            key={report.id} 
                            position={[report.latitude, report.longitude]}
                            icon={getReportMarkerIcon(report)}
                            eventHandlers={{ click: () => onReportClick && onReportClick(report) }}
                        >
                            <Popup>
                                <div className="min-w-[170px] p-1">
                                    <strong className="block text-sm mb-1">{report.title}</strong>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white ${
                                            report.status === 'Resolved' ? 'bg-green-600' :
                                            report.urgency_level === 'High' ? 'bg-red-600' :
                                            report.urgency_level === 'Medium' ? 'bg-orange-500' : 'bg-blue-600'
                                        }`}>
                                            {report.status === 'Resolved' ? 'Resolved ✓' : `${report.urgency_level} Priority`}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 capitalize mb-1">🏢 {report.department || report.type}</p>
                                    <button
                                        onClick={() => onReportClick && onReportClick(report)}
                                        className="mt-1 w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-lg font-bold transition"
                                    >View Details →</button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Hotspot Risk Zones */}
                    {hotspots.map((zone, idx) => (
                        <Circle
                            key={idx}
                            center={[zone.latitude, zone.longitude]}
                            radius={zone.radius}
                            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3, weight: 1.5 }}
                        />
                    ))}
                </MapContainer>

                {/* CENTER PIN FIXED OVERLAY */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[800] pointer-events-none -mt-4">
                    <img 
                        src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png" 
                        alt="Center Pin" 
                        className="h-9 w-5 sm:h-10 sm:w-6 drop-shadow-2xl animate-bounce-short"
                    />
                    <div className="w-2.5 h-1 bg-black/40 rounded-full mx-auto mt-[-2px] blur-[1px]"></div>
                </div>

                {/* BOTTOM ADDRESS CARD */}
                <div className="absolute bottom-4 inset-x-3 sm:bottom-6 sm:left-4 sm:right-4 z-[900]">
                    <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-between gap-3">
                        <div className="overflow-hidden">
                            <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-0.5">SELECTED LOCATION</p>
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                                {centerAddress}
                            </h3>
                            {centerCoords && (
                                <p className="text-[9px] sm:text-[10px] text-gray-400 font-mono mt-0.5">
                                    {centerCoords.lat.toFixed(5)}, {centerCoords.lng.toFixed(5)}
                                </p>
                            )}
                        </div>
                        <div className="shrink-0">
                             {isResolving ? (
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
                             ) : (
                                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                                    ✓
                                </div>
                             )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MapView;
