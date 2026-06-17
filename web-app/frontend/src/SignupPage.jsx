import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const SignupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      let data;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Server unreachable or returned invalid response.');
      }

      if (!res.ok) throw new Error(data?.detail || 'Registration failed');
      
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
    <div className="min-h-screen w-full bg-background text-on-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8b5cf6] blur-[150px] opacity-20 pointer-events-none"></div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full min-w-[320px] sm:min-w-[400px] max-w-md bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-8 ambient-shadow relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6] to-secondary rounded-xl flex items-center justify-center mb-4 ambient-shadow">
            <span className="material-symbols-outlined text-white text-[28px]">group_add</span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold text-on-surface">Create an Account</h1>
          <p className="text-on-surface-variant text-sm mt-2">Start automating your HR workflow today.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Full Name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">person</span>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                placeholder="Jane Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
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
                className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                placeholder="••••••••"
                minLength="8"
              />
            </div>
          </div>

          {error && <div className="text-error text-sm bg-error-container p-3 rounded-xl border border-error/20">{error}</div>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#8b5cf6] to-secondary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-[0_4px_14px_0_rgba(46,196,182,0.39)] mt-2 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-8">
          Already have an account? <Link to="/login" className="text-secondary font-bold hover:underline">Sign in instead</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
