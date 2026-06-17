import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8b5cf6] blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary blur-[150px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-8 ambient-shadow relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary to-[#8b5cf6] rounded-xl flex items-center justify-center mb-4 ambient-shadow">
            <span className="material-symbols-outlined text-white text-[28px]">troubleshoot</span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold text-on-surface">Welcome Back</h1>
          <p className="text-on-surface-variant text-sm mt-2">Sign in to TalentFlow AI to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-all"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end mt-1">
              <a href="#" className="text-sm text-secondary hover:text-on-secondary-container transition-colors">Forgot password?</a>
            </div>
          </div>

          {error && <div className="text-error text-sm bg-error-container p-3 rounded-xl border border-error/20">{error}</div>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-secondary to-[#8b5cf6] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] mt-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-outline-variant/50"></div>
          <span className="text-sm text-on-surface-variant">or continue with</span>
          <div className="flex-1 h-px bg-outline-variant/50"></div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full mt-6 bg-surface-container border border-outline-variant text-on-surface font-semibold py-3 rounded-xl hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Google
        </button>

        <p className="text-center text-sm text-on-surface-variant mt-8">
          Don't have an account? <Link to="/signup" className="text-[#8b5cf6] font-bold hover:underline">Sign up for free</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
