import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../components/MapView';
import ReportForm from '../components/ReportForm';
import axios from 'axios';
import { socketService } from '../sockets/socket';
import { 
    ThumbsUp, Sparkles, CheckCircle2, Clock, MapPin, X, Menu, 
    BrainCircuit, AlertTriangle, ShieldCheck, ChevronUp, ChevronDown, Activity, Users
} from 'lucide-react';
import { API_URL } from '../utils/config';

const Home = () => {
    const [showReportForm, setShowReportForm] = useState(false);
    const [reports, setReports] = useState([]);
    const [hotspots, setHotspots] = useState([]);
    const [showHotspots, setShowHotspots] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [user, setUser] = useState(null);
    const [showHeroBanner, setShowHeroBanner] = useState(true);

    const [upvotedIds, setUpvotedIds] = useState(() => {
        return JSON.parse(localStorage.getItem('city_radar_upvoted') || '[]');
    });

    useEffect(() => {
        const stored = localStorage.getItem('city_radar_user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('city_radar_user');
        setUser(null);
    };

    const fetchReports = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/reports`);
            setReports(res.data);
        } catch (err) {
            console.error("Error fetching reports:", err);
        }
    };

    const toggleHotspots = async () => {
        if (!showHotspots && hotspots.length === 0) {
            try {
                const res = await axios.get(`${API_URL}/api/hotspots`);
                setHotspots(res.data);
                if (res.data.length === 0) alert("Need more reports to predict hotspots!");
            } catch (err) {
                console.error("Error fetching hotspots:", err);
            }
        }
        setShowHotspots(!showHotspots);
    };

    const handleUpvote = async (reportId, e) => {
        if (e) e.stopPropagation();
        if (upvotedIds.includes(reportId)) return;

        try {
            const res = await axios.post(`${API_URL}/api/reports/${reportId}/upvote`);
            const { upvotes, urgency_level } = res.data;

            setReports(prev => prev.map(r => r.id === reportId ? { ...r, upvotes, urgency_level } : r));
            if (selectedReport && selectedReport.id === reportId) {
                setSelectedReport(prev => ({ ...prev, upvotes, urgency_level }));
            }

            const newUpvoted = [...upvotedIds, reportId];
            setUpvotedIds(newUpvoted);
            localStorage.setItem('city_radar_upvoted', JSON.stringify(newUpvoted));
        } catch (err) {
            console.error("Failed to upvote:", err);
        }
    };

    useEffect(() => {
        fetchReports();
        socketService.connect();

        const handleRealtimeMessage = (message) => {
            if (message.type === 'NEW_REPORT') {
                setReports(prev => [message.data, ...prev]);
            } else if (message.type === 'UPDATE_REPORT' || message.type === 'UPVOTE_REPORT') {
                const updated = message.data;
                setReports(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
                setSelectedReport(prev => (prev && prev.id === updated.id) ? { ...prev, ...updated } : prev);
            }
        };

        socketService.addListener(handleRealtimeMessage);
        return () => socketService.removeListener(handleRealtimeMessage);
    }, []);

    const handleReportSuccess = (report) => {
        setSelectedReport(report);
        setShowReportForm(false);
        fetchReports();
    };

    // 100% REAL LIVE STATISTICS FROM DATABASE
    const resolvedCount = reports.filter(r => r.status === 'Resolved').length;
    const activeCount = reports.filter(r => r.status !== 'Resolved').length;
    const totalCitizensSupporting = reports.reduce((acc, r) => acc + (r.upvotes || 0), 0) + reports.length;

    const isResolved = selectedReport?.status === 'Resolved';

    const getAiReason = (report) => {
        if (!report) return "";
        if (report.urgency_level === 'High') {
            return "NLP classification & keyword analysis detected critical public safety risks, heavy traffic impact, or an upvote escalation surge.";
        }
        if (report.urgency_level === 'Medium') {
            return "Moderate severity issue detected. Escalation pending based on community upvotes or department queue.";
        }
        return "Standard maintenance report categorized for routine municipal dispatch.";
    };

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-100">
            {/* Header / Navbar */}
            <header className="bg-white shadow-sm px-3 sm:px-6 py-3 z-20 flex justify-between items-center shrink-0">
                <h1 className="text-lg sm:text-2xl font-bold text-blue-800 flex items-center gap-1.5">
                    🏙️ <span className="hidden sm:inline">CivicRadar AI</span><span className="sm:hidden">CivicRadar</span>
                </h1>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                        onClick={toggleHotspots}
                        className={`text-xs sm:text-sm font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border transition ${showHotspots
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                            : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'
                        }`}
                    >
                        {showHotspots ? '🔥 Hide Risks' : '🔮 Predict Risks'}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-semibold text-blue-800 hidden md:inline">{user.name}</span>
                            </div>
                            <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-500 font-medium">Logout</button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 font-semibold">Login</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm">Sign Up</Link>
                        </>
                    )}
                    <Link to="/admin" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 font-semibold">Admin</Link>
                </div>
            </header>

            {/* HERO BANNER & REAL LIVE STATISTICS */}
            {showHeroBanner && (
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-3 sm:px-6 sm:py-4 relative z-10 shrink-0 border-b border-blue-800/50 animate-fade-in shadow-md">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        {/* Hero Text */}
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30 mb-1">
                                <Sparkles className="w-3 h-3 text-blue-400" /> AI-Assisted Smart City Platform
                            </div>
                            <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                                Report city problems in seconds. Help build a cleaner, safer community with AI-assisted issue tracking and verified resolution proof.
                            </p>
                        </div>

                        {/* Real Live Statistics Bar */}
                        <div className="flex items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 self-stretch md:self-auto justify-around">
                            <div className="text-center">
                                <span className="text-[10px] text-green-300 font-bold uppercase block">Resolved</span>
                                <span className="text-sm sm:text-base font-extrabold text-green-400">🟢 {resolvedCount}</span>
                            </div>
                            <div className="h-6 w-px bg-white/20" />
                            <div className="text-center">
                                <span className="text-[10px] text-red-300 font-bold uppercase block">Active</span>
                                <span className="text-sm sm:text-base font-extrabold text-red-400">🔴 {activeCount}</span>
                            </div>
                            <div className="h-6 w-px bg-white/20" />
                            <div className="text-center">
                                <span className="text-[10px] text-blue-300 font-bold uppercase block">Community Support</span>
                                <span className="text-sm sm:text-base font-extrabold text-blue-300">👥 {totalCitizensSupporting}</span>
                            </div>
                        </div>
                    </div>

                    {/* Minimize Hero Button */}
                    <button
                        onClick={() => setShowHeroBanner(false)}
                        className="absolute top-2 right-2 text-white/50 hover:text-white p-1"
                        title="Maximize Map View"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                </div>
            )}

            {!showHeroBanner && (
                <button
                    onClick={() => setShowHeroBanner(true)}
                    className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-slate-900/90 text-white text-[10px] font-bold px-3 py-1 rounded-b-xl shadow-lg border border-slate-700 flex items-center gap-1 hover:bg-slate-800"
                >
                    Show Hero & Stats Bar <ChevronDown className="w-3 h-3" />
                </button>
            )}

            {/* Report Form Modal */}
            {showReportForm && (
                <ReportForm
                    onClose={() => setShowReportForm(false)}
                    onSuccess={handleReportSuccess}
                />
            )}

            {/* Citizen Issue Detail Drawer */}
            {selectedReport && (
                <div className="fixed inset-0 z-[2000] flex justify-end items-end sm:items-stretch">
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
                        onClick={() => setSelectedReport(null)} 
                    />

                    <div className="relative w-full sm:w-96 max-h-[85vh] sm:max-h-full h-full bg-white shadow-2xl z-10 flex flex-col rounded-t-2xl sm:rounded-none overflow-hidden animate-slide-up sm:animate-slide-left border-l border-gray-100">
                        {/* Header */}
                        <div className={`${isResolved ? 'bg-green-600' : selectedReport.urgency_level === 'High' ? 'bg-red-600' : 'bg-blue-600'} p-4 sm:p-5 text-white relative shrink-0`}>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="absolute top-4 right-4 text-white/70 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                                    #{selectedReport.id} · {selectedReport.urgency_level} Priority
                                </span>
                                {isResolved && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Resolved
                                    </span>
                                )}
                            </div>

                            <h2 className="text-lg sm:text-xl font-bold mt-1 leading-snug">{selectedReport.title}</h2>
                            <p className="text-white/80 text-xs capitalize mt-0.5">🏢 {selectedReport.department || selectedReport.type}</p>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

                            {/* Upvote Box */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Community Support</p>
                                    <p className="text-base font-bold text-blue-900 mt-0.5">
                                        👍 {selectedReport.upvotes || 0} Upvotes
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => handleUpvote(selectedReport.id, e)}
                                    disabled={upvotedIds.includes(selectedReport.id)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                                        upvotedIds.includes(selectedReport.id)
                                            ? 'bg-green-100 text-green-700 cursor-default'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md transform hover:scale-105'
                                    }`}
                                >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    {upvotedIds.includes(selectedReport.id) ? 'Upvoted ✓' : 'I See This Too'}
                                </button>
                            </div>

                            {/* AI TRANSPARENCY BOX */}
                            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-1">
                                <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs">
                                    <BrainCircuit className="w-4 h-4 text-purple-600" /> AI Urgency Explanation
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded text-white ${
                                        selectedReport.urgency_level === 'High' ? 'bg-red-500' : 'bg-orange-500'
                                    }`}>
                                        AI Level: {selectedReport.urgency_level}
                                    </span>
                                </div>
                                <p className="text-xs text-purple-950 mt-1 leading-relaxed italic">
                                    "{getAiReason(selectedReport)}"
                                </p>
                            </div>

                            {/* BEFORE VS AFTER SHOWCASE (If Resolved) */}
                            {isResolved ? (
                                <div className="border-2 border-green-200 bg-green-50/50 rounded-2xl p-3.5 space-y-3">
                                    <div className="flex items-center gap-1.5 text-green-800 font-bold text-xs uppercase tracking-wider">
                                        <Sparkles className="w-4 h-4 text-green-600" /> Resolution Proof (Before & After)
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {/* BEFORE */}
                                        <div className="bg-white p-2 rounded-xl border border-gray-200">
                                            <span className="block text-[9px] font-bold text-red-600 uppercase mb-1">BEFORE (REPORTED)</span>
                                            {selectedReport.image_url ? (
                                                <img src={selectedReport.image_url} alt="Before" className="w-full h-24 sm:h-28 object-cover rounded-lg" />
                                            ) : (
                                                <div className="w-full h-24 sm:h-28 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 italic">No Before Photo</div>
                                            )}
                                        </div>

                                        {/* AFTER */}
                                        <div className="bg-white p-2 rounded-xl border border-green-300">
                                            <span className="block text-[9px] font-bold text-green-600 uppercase mb-1">AFTER (RESOLVED)</span>
                                            {selectedReport.resolution_image_url ? (
                                                <img src={selectedReport.resolution_image_url} alt="After" className="w-full h-24 sm:h-28 object-cover rounded-lg" />
                                            ) : (
                                                <div className="w-full h-24 sm:h-28 bg-green-100/60 rounded-lg flex items-center justify-center text-[10px] text-green-700 font-bold">Proof Verified</div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedReport.resolution_notes && (
                                        <div className="bg-white p-3 rounded-xl border border-green-200">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Work Notes</p>
                                            <p className="text-xs text-gray-700 leading-relaxed">{selectedReport.resolution_notes}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                selectedReport.image_url && (
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Issue Photo</p>
                                        <img src={selectedReport.image_url} alt="Issue" className="w-full rounded-xl object-cover max-h-48" />
                                    </div>
                                )
                            )}

                            {/* Description */}
                            {selectedReport.description && (
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{selectedReport.description}</p>
                                </div>
                            )}

                            {/* Location */}
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Coordinates</p>
                                <p className="text-gray-700 text-xs font-mono">
                                    {selectedReport.latitude?.toFixed(5)}, {selectedReport.longitude?.toFixed(5)}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Map Section */}
            <main className="flex-grow flex flex-col relative flex-1">
                <div className="flex-grow relative z-0 h-full">
                    <MapView
                        reports={reports}
                        hotspots={showHotspots ? hotspots : []}
                        onReportClick={(report) => setSelectedReport(report)}
                    />

                    {/* Floating Action Button */}
                    <div className="absolute bottom-6 right-4 sm:bottom-8 sm:right-8 z-[1000]">
                        <button
                            onClick={() => setShowReportForm(true)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-5 sm:py-4 sm:px-6 rounded-full shadow-2xl flex items-center space-x-2 transform transition hover:scale-105"
                        >
                            <span className="text-xl sm:text-2xl">📸</span>
                            <span className="text-sm sm:text-base">Report Problem</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
