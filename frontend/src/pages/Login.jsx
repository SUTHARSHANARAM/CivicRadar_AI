import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Enter a valid email address';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoginError('');
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});

        // Check against registered users in localStorage
        const users = JSON.parse(localStorage.getItem('city_radar_users') || '[]');
        const found = users.find(u => u.email === email && u.password === password);

        if (found) {
            // Save session
            localStorage.setItem('city_radar_user', JSON.stringify({ name: found.name, email: found.email }));
            navigate('/');
        } else {
            setLoginError('Invalid email or password. Please try again or create an account.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
                {/* Logo / Header */}
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🏙️</div>
                    <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
                    <p className="text-sm text-gray-500 mt-1">Sign in to City Problem Radar</p>
                </div>

                {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                        ⚠️ {loginError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            placeholder="you@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">⚠ {errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})); }}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Min. 6 characters"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">⚠ {errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all transform hover:scale-[1.01]"
                    >
                        Sign In
                    </button>
                </form>

                <p className="mt-5 text-center text-sm text-gray-500">
                    First time here?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
