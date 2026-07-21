import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Full name is required';
        if (!form.email.trim()) {
            errs.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'Enter a valid email address';
        }
        if (!form.password) {
            errs.password = 'Password is required';
        } else if (form.password.length < 6) {
            errs.password = 'Password must be at least 6 characters';
        }
        if (!form.confirm) {
            errs.confirm = 'Please confirm your password';
        } else if (form.password !== form.confirm) {
            errs.confirm = 'Passwords do not match';
        }
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('city_radar_users') || '[]');
        if (users.find(u => u.email === form.email)) {
            setErrors({ email: 'This email is already registered. Try logging in.' });
            return;
        }

        // Save user
        users.push({ name: form.name, email: form.email, password: form.password });
        localStorage.setItem('city_radar_users', JSON.stringify(users));

        // Auto-login
        localStorage.setItem('city_radar_user', JSON.stringify({ name: form.name, email: form.email }));
        setSuccess(true);
        setTimeout(() => navigate('/'), 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🏙️</div>
                    <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
                    <p className="text-sm text-gray-500 mt-1">Join City Problem Radar</p>
                </div>

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4 text-center">
                        ✅ Account created! Redirecting...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Your full name"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">⚠ {errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            placeholder="you@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">⚠ {errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Min. 6 characters"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">⚠ {errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirm"
                            value={form.confirm}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.confirm ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Re-enter password"
                        />
                        {errors.confirm && <p className="text-red-500 text-xs mt-1">⚠ {errors.confirm}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all transform hover:scale-[1.01]"
                    >
                        Create Account
                    </button>
                </form>

                <p className="mt-5 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-semibold">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
