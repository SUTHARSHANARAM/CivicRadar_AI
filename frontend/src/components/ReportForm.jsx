import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Camera, MapPin, Loader, Upload, Search, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API_URL } from '../utils/config';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks/drags & smooth flyTo
const LocationMarker = ({ position, setPosition }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 16, { animate: true, duration: 1 });
        }
    }, [position, map]);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    setPosition(e.target.getLatLng());
                },
            }}
        />
    );
};

const ReportForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'Pothole',
        description: '',
        latitude: 28.6139,
        longitude: 77.2090,
        image: null,
        imageUrlStr: ''
    });
    const [loading, setLoading] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const [searchingLocation, setSearchingLocation] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Initial Geolocation Detection
    const detectCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                },
                (error) => {
                    console.error("Location error:", error);
                },
                { enableHighAccuracy: true }
            );
        }
    };

    useEffect(() => {
        detectCurrentLocation();
        return () => stopCamera();
    }, []);

    // Search Address to Pin
    const handleAddressSearch = async (e) => {
        e.preventDefault();
        if (!locationInput.trim()) return;

        setSearchingLocation(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
            } else {
                alert("Location not found. Please try a different landmark or street name.");
            }
        } catch (err) {
            console.error("Geocoding failed:", err);
        } finally {
            setSearchingLocation(false);
        }
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Could not access camera. Please check camera permissions.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        if (!video) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({ ...prev, imageUrlStr: dataUrl, image: null }));
        stopCamera();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationChange = (latlng) => {
        setFormData(prev => ({
            ...prev,
            latitude: latlng.lat,
            longitude: latlng.lng
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: file, imageUrlStr: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                title: formData.title,
                type: formData.type,
                description: formData.description,
                latitude: formData.latitude,
                longitude: formData.longitude,
                image_url: formData.imageUrlStr || null
            };

            const response = await axios.post(`${API_URL}/api/reports`, payload);
            onSuccess(response.data);
            onClose();
        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to submit report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-[3000] p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in max-h-[92vh] sm:max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="bg-blue-600 p-4 flex justify-between items-center shrink-0">
                    <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                        <Camera className="w-5 h-5" /> Report City Problem
                    </h2>
                    <button onClick={() => { stopCamera(); onClose(); }} className="text-white/80 hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">

                    {/* Title */}
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Issue Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. Big Pothole near Main Market"
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Category</label>
                        <select
                            name="type"
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option>Pothole</option>
                            <option>Streetlight</option>
                            <option>Garbage</option>
                            <option>Traffic Signal</option>
                            <option>Water Leak</option>
                            <option>Other</option>
                        </select>
                    </div>

                    {/* Location Options: 3-in-1 Location Picker */}
                    <div className="space-y-2">
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 flex justify-between items-center">
                            <span>Select Location</span>
                            <span className="text-[10px] text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">
                                {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                            </span>
                        </label>

                        {/* Search Address Box + Detect Button */}
                        <div className="flex gap-2">
                            <div className="flex-1 flex bg-slate-50 rounded-xl border border-gray-300 overflow-hidden">
                                <input
                                    type="text"
                                    placeholder="Type street, landmark or area..."
                                    className="flex-1 px-3 py-2 text-xs outline-none bg-transparent"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddressSearch}
                                    disabled={searchingLocation}
                                    className="px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center"
                                >
                                    {searchingLocation ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={detectCurrentLocation}
                                className="bg-slate-100 hover:bg-slate-200 border border-gray-300 text-blue-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition"
                                title="Detect Current GPS Location"
                            >
                                <Navigation className="w-3.5 h-3.5" /> GPS
                            </button>
                        </div>

                        {/* Map View */}
                        <div className="h-36 sm:h-44 w-full rounded-xl overflow-hidden border border-gray-300 relative z-0 shadow-inner">
                            <MapContainer
                                center={[formData.latitude, formData.longitude]}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
                                    attribution='&copy; Google Maps'
                                />
                                <LocationMarker
                                    position={{ lat: formData.latitude, lng: formData.longitude }}
                                    setPosition={handleLocationChange}
                                />
                            </MapContainer>
                        </div>
                    </div>

                    {/* Photo Evidence */}
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Photo Evidence</label>

                        {isCameraOpen ? (
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={capturePhoto}
                                        className="bg-white text-black font-bold py-1.5 px-5 rounded-full text-xs shadow-lg hover:bg-gray-200"
                                    >
                                        📸 Capture
                                    </button>
                                    <button
                                        type="button"
                                        onClick={stopCamera}
                                        className="bg-red-600 text-white font-bold py-1.5 px-4 rounded-full text-xs shadow-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : formData.imageUrlStr ? (
                            <div className="relative w-full h-36 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                <img
                                    src={formData.imageUrlStr}
                                    alt="Evidence preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, image: null, imageUrlStr: '' })}
                                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                    PHOTO ATTACHED
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    <Upload className="w-5 h-5 text-blue-600 mb-1" />
                                    <span className="text-xs font-bold text-gray-700">Choose File</span>
                                </label>

                                <button
                                    type="button"
                                    onClick={startCamera}
                                    className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-500 transition"
                                >
                                    <Camera className="w-5 h-5 text-green-600 mb-1" />
                                    <span className="text-xs font-bold text-gray-700">Live Camera</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                        <textarea
                            name="description"
                            rows="2"
                            placeholder="Describe the issue..."
                            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg flex justify-center items-center gap-2 transition disabled:opacity-50"
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : '🚀 Submit Report'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default ReportForm;
