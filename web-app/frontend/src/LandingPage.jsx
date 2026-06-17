import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md selection:bg-secondary selection:text-on-secondary overflow-x-hidden relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#8b5cf6] blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary blur-[150px] opacity-20 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-[#8b5cf6] rounded-xl flex items-center justify-center ambient-shadow">
            <span className="material-symbols-outlined text-white text-[24px]">troubleshoot</span>
          </div>
          <span className="font-headline-md text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-on-background to-on-surface-variant">
            TalentFlow AI
          </span>
        </div>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="hidden sm:inline-flex items-center justify-center px-6 py-2 border border-outline-variant rounded-full text-on-surface hover:bg-surface-container hover:border-secondary transition-all duration-300 font-medium"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline-variant/50 mb-8 animate-[fade-in_1s_ease-out]">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="text-sm font-medium text-on-surface-variant">Vercel Deployment Live</span>
        </div>
        
        <h1 className="font-display-lg text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-tight">
          Next-Gen <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-[#8b5cf6] ai-glow">HR Intelligence</span>
          <br />for Modern Teams
        </h1>
        
        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-12">
          Automate resume parsing, streamline interview scheduling, and discover the perfect candidates using state-of-the-art AI models.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-secondary text-on-secondary font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(46,196,182,0.3)] hover:shadow-[0_0_60px_rgba(46,196,182,0.5)]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-2 text-lg">
              Go to Dashboard
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </span>
          </button>
          
          <button 
            className="inline-flex items-center justify-center px-8 py-4 bg-surface-container border border-outline-variant text-on-surface font-semibold rounded-full hover:bg-surface-container-high transition-colors text-lg"
          >
            <span className="material-symbols-outlined mr-2">play_circle</span>
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to hire faster</h2>
          <p className="text-on-surface-variant">Powerful tools designed to completely eliminate manual screening.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="group bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-8 hover:border-[#8b5cf6]/50 transition-all duration-500 ambient-shadow hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-2xl group-hover:bg-[#8b5cf6]/20 transition-all"></div>
            <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center mb-6 text-[#8b5cf6] border border-outline-variant/30">
              <span className="material-symbols-outlined text-[28px]">psychology</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">AI Auto-Screening</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Upload hundreds of resumes at once. Our AI reads, parses, and scores them against your job descriptions instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-8 hover:border-secondary/50 transition-all duration-500 ambient-shadow hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all"></div>
            <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center mb-6 text-secondary border border-outline-variant/30">
              <span className="material-symbols-outlined text-[28px]">troubleshoot</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">ATS Keyword Match</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Ensure candidate resumes pass strict ATS filters with our built-in keyword analyzer and detailed feedback reports.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-8 hover:border-[#d97706]/50 transition-all duration-500 ambient-shadow hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#d97706]/10 rounded-full blur-2xl group-hover:bg-[#d97706]/20 transition-all"></div>
            <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center mb-6 text-[#d97706] border border-outline-variant/30">
              <span className="material-symbols-outlined text-[28px]">calendar_today</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">Interview Scheduler</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Manage shortlisted candidates and automatically generate meeting links for seamless technical and HR rounds.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/30 mt-20 py-8 relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-on-surface-variant text-sm gap-4">
          <p>© 2026 TalentFlow AI. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-on-surface cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-on-surface cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-on-surface cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
