import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
    LayoutDashboard, CheckCircle, AlertOctagon, Activity, Map, X, MapPin, 
    Clock, Tag, FileText, Camera, Upload, Download, Check, Sparkles, Building2, Filter
} from 'lucide-react';
import { API_URL } from '../utils/config';

const DEPARTMENTS = [
    "All",
    "PWD / Roads Department",
    "Electricity & Lighting Board",
    "Sanitation & Waste Management",
    "Water Supply & Sewerage Board",
    "Traffic & Transit Authority",
    "General Municipal Works"
];

// --- Resolution Modal Component ---
const ResolveModal = ({ report, onClose, onSuccess }) => {
    const [notes, setNotes] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            console.error("Camera access failed:", err);
            alert("Camera access denied or unavailable.");
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
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImageUrl(dataUrl);
        stopCamera();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.put(`${API_URL}/api/reports/${report.id}`, {
                status: 'Resolved',
                resolution_image_url: imageUrl || null,
                resolution_notes: notes.trim() || 'Issue repaired by municipal maintenance team.'
            });
            onSuccess();
        } catch (err) {
            console.error("Failed to submit resolution:", err);
            alert("Error saving resolution. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-fade-in max-h-[92vh] overflow-y-auto">
                <div className="bg-green-600 p-4 sm:p-5 text-white flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                            Report #{report.id}
                        </span>
                        <h2 className="text-lg sm:text-xl font-bold mt-0.5">Post Resolution Proof</h2>
                    </div>
                    <button onClick={() => { stopCamera(); onClose(); }} className="text-white/70 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                    {/* Before Photo Banner */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                        {report.image_url ? (
                            <img src={report.image_url} alt="Before" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                BEFORE
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Original Issue</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{report.title}</p>
                            <p className="text-[10px] text-blue-600 font-bold">{report.department}</p>
                        </div>
                    </div>

                    {/* Resolution Notes */}
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                            Resolution Details / Action Taken <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Asphalt patching completed by PWD road repair unit."
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                    {/* Resolution Photo Upload */}
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                            After Repair Photo Proof
                        </label>

                        {isCameraOpen ? (
                            <div className="relative rounded-xl overflow-hidden bg-black">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-40 object-cover" />
                                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={capturePhoto}
                                        className="bg-white text-green-700 font-bold px-4 py-1.5 rounded-full text-xs shadow-lg"
                                    >
                                        📸 Take Photo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={stopCamera}
                                        className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-full text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : imageUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-green-200">
                                <img src={imageUrl} alt="After Proof" className="w-full h-36 object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setImageUrl('')}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <span className="absolute bottom-2 left-2 bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                                    AFTER PROOF ATTACHED
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={startCamera}
                                    className="border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50/50 p-3 rounded-xl flex flex-col items-center justify-center transition"
                                >
                                    <Camera className="w-5 h-5 text-green-600 mb-1" />
                                    <span className="text-xs font-bold text-gray-700">Live Camera</span>
                                </button>
                                <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 p-3 rounded-xl flex flex-col items-center justify-center cursor-pointer transition">
                                    <Upload className="w-5 h-5 text-blue-600 mb-1" />
                                    <span className="text-xs font-bold text-gray-700">Choose File</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 flex gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => { stopCamera(); onClose(); }}
                            className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-60"
                        >
                            {submitting ? 'Saving...' : 'Mark Done & Publish ✓'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Detail Panel Component ---
const ReportDetailPanel = ({ report, onClose, onOpenResolve }) => {
    const [address, setAddress] = useState('Fetching address...');

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${report.latitude}&lon=${report.longitude}`
                );
                const data = await res.json();
                setAddress(data.display_name || 'Unknown location');
            } catch {
                setAddress('Unable to fetch address');
            }
        };
        fetchAddress();
    }, [report]);

    const isResolved = report.status === 'Resolved';
    const urgencyBg = report.urgency_level === 'High' ? 'bg-red-500'
        : report.urgency_level === 'Medium' ? 'bg-orange-400'
        : 'bg-green-500';

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in">

                {/* Header */}
                <div className={`${urgencyBg} p-4 sm:p-5 text-white relative shrink-0`}>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                        #{report.id} · {report.urgency_level} Priority · 👍 {report.upvotes || 0} Upvotes
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold mt-1.5 leading-snug">{report.title}</h2>
                    <p className="text-white/90 text-xs sm:text-sm font-semibold flex items-center gap-1 mt-1">
                        <Building2 className="w-4 h-4" /> {report.department || 'General Municipal Works'}
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                        <span className="text-xs font-bold text-gray-500 uppercase">Assigned Department</span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            {report.department || 'General Municipal Works'}
                        </span>
                    </div>

                    {/* Location */}
                    <div className="bg-slate-50 p-3.5 rounded-xl">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">📍 Address</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">{address}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">{report.latitude?.toFixed(5)}, {report.longitude?.toFixed(5)}</p>
                    </div>

                    {/* Description */}
                    {report.description && (
                        <div className="bg-slate-50 p-3.5 rounded-xl">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">📝 Problem Description</p>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{report.description}</p>
                        </div>
                    )}

                    {/* BEFORE VS AFTER SHOWCASE */}
                    {isResolved ? (
                        <div className="border-2 border-green-200 bg-green-50/40 rounded-2xl p-3.5 space-y-3">
                            <div className="flex items-center gap-1.5 text-green-800 font-bold text-xs">
                                <Sparkles className="w-4 h-4 text-green-600" /> Resolution Proof & Action Taken
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white p-2 rounded-xl border border-gray-200">
                                    <span className="block text-[9px] font-bold text-red-600 uppercase mb-1">BEFORE (REPORTED)</span>
                                    {report.image_url ? (
                                        <img src={report.image_url} alt="Before" className="w-full h-28 object-cover rounded-lg" />
                                    ) : (
                                        <div className="w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 italic">No Before Photo</div>
                                    )}
                                </div>

                                <div className="bg-white p-2 rounded-xl border border-green-300">
                                    <span className="block text-[9px] font-bold text-green-600 uppercase mb-1">AFTER (RESOLVED)</span>
                                    {report.resolution_image_url ? (
                                        <img src={report.resolution_image_url} alt="After" className="w-full h-28 object-cover rounded-lg" />
                                    ) : (
                                        <div className="w-full h-28 bg-green-100/50 rounded-lg flex items-center justify-center text-[10px] text-green-600 font-bold">Proof Attached</div>
                                    )}
                                </div>
                            </div>

                            {report.resolution_notes && (
                                <div className="bg-white p-3 rounded-xl border border-green-200">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Work Notes</p>
                                    <p className="text-xs text-gray-800">{report.resolution_notes}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        report.image_url && (
                            <div className="bg-slate-50 p-3.5 rounded-xl">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Issue Photo</p>
                                <img src={report.image_url} alt="Reported issue" className="w-full h-44 object-cover rounded-xl" />
                            </div>
                        )
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-5 border-t border-gray-100 flex gap-2 sm:gap-3 shrink-0">
                    <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-bold text-xs sm:text-sm">
                        Close
                    </button>
                    {!isResolved && (
                        <button
                            onClick={() => { onClose(); onOpenResolve(report); }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-lg"
                        >
                            <CheckCircle className="w-4 h-4" /> Mark Done & Proof
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Admin Dashboard ---
const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, high_urgency: 0 });
    const [reports, setReports] = useState([]);
    const [selectedDept, setSelectedDept] = useState("All");
    const [selectedReport, setSelectedReport] = useState(null);
    const [resolvingReport, setResolvingReport] = useState(null);

    const fetchData = async () => {
        try {
            const [statsRes, reportsRes] = await Promise.all([
                axios.get(`${API_URL}/api/stats`),
                axios.get(`${API_URL}/api/reports${selectedDept !== 'All' ? `?department=${encodeURIComponent(selectedDept)}` : ''}`)
            ]);
            setStats(statsRes.data);
            setReports(reportsRes.data);
        } catch (error) {
            console.error("Error fetching admin data", error);
        }
    };

    useEffect(() => { fetchData(); }, [selectedDept]);

    const exportCSV = () => {
        if (reports.length === 0) return alert("No reports to export");
        const headers = ["ID", "Title", "Type", "Department", "Urgency", "Status", "Upvotes", "Latitude", "Longitude", "Resolution Notes"];
        const rows = reports.map(r => [
            r.id,
            `"${r.title.replace(/"/g, '""')}"`,
            r.type,
            `"${r.department || 'General Municipal Works'}"`,
            r.urgency_level,
            r.status,
            r.upvotes || 0,
            r.latitude,
            r.longitude,
            `"${(r.resolution_notes || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `city_problem_reports_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-3 sm:p-6">

            {/* Modals */}
            {selectedReport && (
                <ReportDetailPanel
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onOpenResolve={(report) => setResolvingReport(report)}
                />
            )}

            {resolvingReport && (
                <ResolveModal
                    report={resolvingReport}
                    onClose={() => setResolvingReport(null)}
                    onSuccess={() => {
                        setResolvingReport(null);
                        fetchData();
                    }}
                />
            )}

            {/* Header */}
            <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <Link to="/" className="text-xs sm:text-sm text-blue-600 hover:underline mb-1 inline-block font-semibold">← Back to Map</Link>
                    <h1 className="text-xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                        Admin Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">Automated Department Routing & Resolution Proof</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={exportCSV}
                        className="flex-1 sm:flex-none bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-xl shadow-sm hover:bg-blue-100 flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button onClick={fetchData} className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-xl shadow hover:bg-gray-50 text-xs sm:text-sm font-semibold">
                        Refresh
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6">
                {[
                    { label: 'Total Reports', value: stats.total, icon: Activity, color: 'bg-blue-100 text-blue-800' },
                    { label: 'High Priority', value: stats.high_urgency, icon: AlertOctagon, color: 'bg-red-100 text-red-800' },
                    { label: 'Pending', value: stats.pending, icon: Map, color: 'bg-yellow-100 text-yellow-800' },
                    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-green-100 text-green-800' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-3.5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 tracking-wider">{stat.label}</h3>
                            <p className="text-2xl sm:text-4xl font-bold mt-1 text-slate-800">{stat.value}</p>
                        </div>
                        <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl ${stat.color}`}>
                            <stat.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Department Filter Bar */}
            <div className="mb-6 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2 overflow-x-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider px-2 shrink-0">
                    <Filter className="w-3.5 h-3.5" /> Department:
                </div>
                <div className="flex gap-2">
                    {DEPARTMENTS.map((dept) => (
                        <button
                            key={dept}
                            onClick={() => setSelectedDept(dept)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                                selectedDept === dept
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {dept}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-sm sm:text-lg text-slate-700">
                        {selectedDept === 'All' ? 'All Citizen Reports' : `${selectedDept} Issues`}
                    </h3>
                    <span className="text-[10px] sm:text-xs text-blue-700 bg-blue-100 font-bold px-2.5 py-0.5 sm:py-1 rounded-full">
                        {reports.length} Reports
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 text-gray-400 text-[10px] sm:text-[11px] uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 sm:px-6">ID</th>
                                <th className="px-4 py-3 sm:px-6">Issue & Category</th>
                                <th className="px-4 py-3 sm:px-6">Assigned Department</th>
                                <th className="px-4 py-3 sm:px-6">Upvotes</th>
                                <th className="px-4 py-3 sm:px-6">Priority</th>
                                <th className="px-4 py-3 sm:px-6">Status</th>
                                <th className="px-4 py-3 sm:px-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                            {reports.map((report) => (
                                <tr
                                    key={report.id}
                                    className="hover:bg-blue-50/50 transition cursor-pointer"
                                    onClick={() => setSelectedReport(report)}
                                >
                                    <td className="px-4 py-3 sm:px-6 text-gray-400 font-mono">#{report.id}</td>
                                    <td className="px-4 py-3 sm:px-6">
                                        <div className="font-semibold text-slate-800">{report.title}</div>
                                        <div className="text-[10px] sm:text-xs text-gray-500 capitalize">{report.type}</div>
                                    </td>
                                    <td className="px-4 py-3 sm:px-6">
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                            <Building2 className="w-3 h-3 text-blue-600" />
                                            {report.department || 'General Municipal Works'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 sm:px-6">
                                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">
                                            👍 {report.upvotes || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 sm:px-6">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                                            report.urgency_level === 'High' ? 'bg-red-100 text-red-700' :
                                            report.urgency_level === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {report.urgency_level}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 sm:px-6">
                                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                                            report.status === 'Resolved' ? 'text-green-600' : 'text-blue-600'
                                        }`}>
                                            {report.status === 'Resolved' ? <CheckCircle className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 sm:px-6" onClick={e => e.stopPropagation()}>
                                        {report.status !== 'Resolved' ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setResolvingReport(report); }}
                                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg shadow font-bold transition flex items-center gap-1"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Mark Done & Proof
                                            </button>
                                        ) : (
                                            <span className="text-[10px] sm:text-xs text-green-700 font-semibold bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                                                Proof Published ✓
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500 italic">No reports found for this department.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
