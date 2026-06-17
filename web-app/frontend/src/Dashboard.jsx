import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('talentflow_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      threshold: 65,
      autoShortlist: true,
      ollamaModel: 'llama3',
      dbBackup: true
    };
  });

  useEffect(() => {
    localStorage.setItem('talentflow_settings', JSON.stringify(settings));
  }, [settings]);

  const [jobRole, setJobRole] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescText, setJobDescText] = useState('');
  const [savingJob, setSavingJob] = useState(false);
  const [jobMessage, setJobMessage] = useState(null);
  const [jobError, setJobError] = useState(null);
  
  const [schedulingCandidateId, setSchedulingCandidateId] = useState(null);
  const [meetLink, setMeetLink] = useState('');
  const [calendarLink, setCalendarLink] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [atsJD, setAtsJD] = useState('');
  const [atsFile, setAtsFile] = useState(null);
  const [atsChecking, setAtsChecking] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsError, setAtsError] = useState(null);
  
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/candidates`);
      if (!res.ok) throw new Error('Failed to fetch candidate logs.');
      const data = await res.json();
      setCandidates(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs`);
      if (!res.ok) throw new Error('Failed to fetch job descriptions.');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!jobRole.trim()) { setUploadError('Please specify a Job Role Target.'); return; }
    if (!files || files.length === 0) { setUploadError('Please select at least one resume file.'); return; }
    
    setUploading(true);
    setUploadError(null);
    setUploadMessage(`Analyzing ${files.length} resume(s)...`);
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('job_role', jobRole);
    formData.append('threshold', settings.threshold);
    if (selectedJobId) { formData.append('job_description_id', selectedJobId); }
    
    try {
      const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        const errors = data.results.filter(r => r.error);
        if (errors.length > 0) {
          setUploadError(`Warning: ${errors.length} file(s) failed to parse (e.g. ${errors[0].filename}: ${errors[0].error})`);
        }
        setUploadMessage(`Finished! Successfully saved ${data.results.length - errors.length} out of ${files.length} resume(s).`);
        fetchCandidates();
      } else {
        const errData = await res.json();
        setUploadError(`Failed to process resumes: ${errData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      setUploadError(`Network error: ${err.message}`);
    }
    
    setUploading(false);
    
    setFiles([]); setSelectedJobId('');
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    
    setTimeout(() => { setShowUploadModal(false); setUploadMessage(null); }, 3000);
  };

  const handleDeleteCandidate = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this candidate?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/candidates/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete candidate.');
      }
      
      setCandidates(prev => prev.filter(c => c.id !== id));
      if (selectedCandidate && selectedCandidate.id === id) {
        setSelectedCandidate(null);
      }
    } catch (err) {
      alert("Error deleting candidate: " + err.message);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescText.trim()) { setJobError('Please fill in both fields.'); return; }
    setSavingJob(true); setJobError(null); setJobMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: jobTitle, description_text: jobDescText }),
      });
      if (!res.ok) throw new Error('Failed to create job description.');
      const data = await res.json();
      setJobMessage(`Job "${data.title}" created successfully!`);
      setJobTitle(''); setJobDescText('');
      fetchJobs();
      setTimeout(() => setJobMessage(null), 3000);
    } catch (err) {
      setJobError(err.message);
    } finally {
      setSavingJob(false);
    }
  };

  const handleScheduleMeetingSubmit = async (e) => {
    e.preventDefault();
    if (!schedulingCandidateId) return;
    setScheduling(true);
    try {
      const formData = new FormData();
      formData.append('meet_link', meetLink);
      formData.append('meeting_link', calendarLink);

      const res = await fetch(`${API_URL}/api/candidates/${schedulingCandidateId}/meeting`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to save interview schedules.');
      
      setCandidates(prev => prev.map(c => c.id === schedulingCandidateId ? { ...c, meet_link: meetLink, meeting_link: calendarLink } : c));
      if (selectedCandidate && selectedCandidate.id === schedulingCandidateId) {
        setSelectedCandidate(prev => ({ ...prev, meet_link: meetLink, meeting_link: calendarLink }));
      }
      setSchedulingCandidateId(null); setMeetLink(''); setCalendarLink('');
      alert('Interview meeting links saved successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setScheduling(false);
    }
  };

  const handleAtsCheckSubmit = async (e) => {
    e.preventDefault();
    if (!atsFile) { setAtsError('Please select your resume file.'); return; }
    if (!atsJD.trim()) { setAtsError('Please paste the Job Description.'); return; }
    setAtsChecking(true); setAtsError(null); setAtsResult(null);

    const formData = new FormData();
    formData.append('file', atsFile);
    formData.append('job_description', atsJD);

    try {
      const res = await fetch(`${API_URL}/api/ats-check`, { method: 'POST', body: formData });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to analyze resume.');
      }
      const result = await res.json();
      setAtsResult(result);
    } catch (err) {
      setAtsError(err.message);
    } finally {
      setAtsChecking(false);
    }
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      const res = await fetch(`${API_URL}/api/candidates/${candidateId}/status`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to update status.');
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const res = await fetch(`${API_URL}/api/report`, { method: 'POST' });
      if (!res.ok) throw new Error('No candidate data available to compile report.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weekly_candidates_report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalCount = candidates.length;
  const shortlistCount = candidates.filter(c => c.status === 'Shortlisted').length;
  const shortlistPct = totalCount > 0 ? ((shortlistCount / totalCount) * 100).toFixed(1) : '0.0';
  const averageScore = totalCount > 0 ? (candidates.reduce((sum, c) => sum + c.score, 0) / totalCount).toFixed(1) : '0.0';
  const activeJobsCount = jobs.length;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || c.job_role === roleFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const rolesList = ['All', ...new Set(candidates.map(c => c.job_role))];

  const getWeeklyApplicationStats = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    candidates.forEach(c => {
      const date = new Date(c.timestamp);
      if (!isNaN(date.getTime())) {
        const dayIdx = date.getDay();
        counts[dayIdx] = counts[dayIdx] + 1;
      }
    });
    return days.map((day, idx) => ({ day: day.substring(0, 3), count: counts[idx] }));
  };

  const chartData = getWeeklyApplicationStats();
  const maxDayCount = Math.max(...chartData.map(d => d.count), 1);
  const topCandidates = [...candidates].sort((a, b) => b.score - a.score).slice(0, 5);

  const NavItem = ({ tab, icon, label }) => {
    const isActive = activeTab === tab;
    return (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`w-full flex items-center px-4 py-2 rounded-lg font-body-md text-body-md transition-all duration-200 ease-in-out ${isActive ? 'text-on-secondary-container bg-secondary-container font-bold' : 'text-on-primary-container hover:text-on-primary hover:bg-primary-fixed-dim/10'}`}
      >
        <span className={`material-symbols-outlined mr-2 ${isActive ? 'icon-fill' : ''}`}>{icon}</span>
        {label}
      </button>
    );
  };

  return (
    <div className="bg-background text-on-background h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-primary-container border-r border-outline-variant flex flex-col py-6 px-4 z-20 hidden md:flex">
        <div className="mb-10">
          <h1 className="font-headline-md text-headline-md text-on-primary font-bold">TalentFlow AI</h1>
          <p className="font-body-sm text-body-sm text-on-primary-container mt-1">HR Intelligence</p>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem tab="dashboard" icon="dashboard" label="Dashboard" />
          <NavItem tab="applicants" icon="group" label="Candidates" />
          <NavItem tab="jobs" icon="work" label="Jobs" />
          <NavItem tab="scheduler" icon="calendar_today" label="Schedule" />
          <NavItem tab="analytics" icon="analytics" label="Analytics" />
          <NavItem tab="ats" icon="troubleshoot" label="ATS Matcher" />
          <NavItem tab="settings" icon="settings" label="Settings" />
        </nav>
        <div className="mt-auto pt-6">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="w-full bg-secondary text-on-secondary font-body-md text-body-md font-bold py-2 px-4 rounded-lg hover:bg-secondary-container transition-colors shadow-sm flex items-center justify-center"
          >
            <span className="material-symbols-outlined mr-2 text-[18px]">upload_file</span>
            Upload Resumes
          </button>
          <div className="flex items-center mt-6 pt-4 border-t border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold">HR</div>
            <div className="ml-3">
              <p className="font-body-md text-body-md text-on-primary font-semibold">HR Administrator</p>
              <p className="font-body-sm text-body-sm text-on-primary-container">Manager Panel</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-sidebar-width h-full overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-b border-outline-variant flex justify-between items-center h-16 px-6 z-10 sticky top-0">
          <div className="flex items-center md:hidden">
            <span className="material-symbols-outlined text-primary text-[24px] cursor-pointer">menu</span>
            <span className="ml-2 font-headline-md text-headline-md font-bold text-on-surface">TalentFlow AI</span>
          </div>
          <div className="hidden md:flex items-center w-96 relative">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">search</span>
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all" 
              placeholder="Search candidates, jobs..." 
              type="text"
            />
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="hidden sm:flex items-center text-secondary font-body-md text-body-md font-semibold hover:bg-surface-container-low px-2 py-1 rounded-md transition-colors" onClick={handleDownloadReport}>
              <span className="material-symbols-outlined mr-1 text-[18px]">download</span> Export Report
            </button>
            <button className="flex items-center text-error font-body-md text-body-md font-semibold hover:bg-error/10 px-2 py-1 rounded-md transition-colors" onClick={handleLogout}>
              <span className="material-symbols-outlined mr-1 text-[18px]">logout</span> Logout
            </button>
          </div>
        </header>

        {/* Dynamic Canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-container-max mx-auto">
            
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <>
                <div className="mb-6">
                  <h2 className="font-display-lg text-display-lg text-on-surface">Overview</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">Real-time insights across your recruitment pipeline.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-4 ambient-shadow flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider">Total Candidates</span>
                      <span className="material-symbols-outlined text-secondary text-[20px] bg-secondary/10 p-1 rounded-md">groups</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline-lg text-headline-lg text-on-surface">{totalCount}</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-4 ambient-shadow flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider">Active Openings</span>
                      <span className="material-symbols-outlined text-[#d97706] text-[20px] bg-[#d97706]/10 p-1 rounded-md">work</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline-lg text-headline-lg text-on-surface">{activeJobsCount}</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-4 ambient-shadow flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider">Shortlist Rate</span>
                      <span className="material-symbols-outlined text-tertiary-container text-[20px] bg-tertiary-container/10 p-1 rounded-md">filter_alt</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline-lg text-headline-lg text-on-surface">{shortlistPct}%</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest border-l-2 border-l-[#8b5cf6] border-y border-r border-outline-variant/50 rounded-xl p-4 ai-glow flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10">
                      <span className="material-symbols-outlined text-[80px] text-[#8b5cf6]">smart_toy</span>
                    </div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider">Avg AI Score</span>
                      <span className="material-symbols-outlined text-[#8b5cf6] text-[20px] bg-[#8b5cf6]/10 p-1 rounded-md">psychology</span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                      <span className="font-headline-lg text-headline-lg text-on-surface">{averageScore}</span>
                      <span className="font-label-mono text-label-mono text-[#8b5cf6] bg-[#8b5cf6]/10 px-1 py-0.5 rounded text-[10px]">AI RATING</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-gradient-to-r from-surface-container to-surface-container-high border border-outline-variant/50 rounded-xl p-4 flex items-start gap-4">
                      <div className="p-2 bg-white rounded-full shadow-sm flex-shrink-0">
                        <span className="material-symbols-outlined text-[#8b5cf6]">auto_awesome</span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-1">AI System Active</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-2">Processed {totalCount} total applications. Review the top candidates from the Leaderboard.</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden ambient-shadow flex-1">
                      <div className="p-4 border-b border-outline-variant/50 bg-surface-bright flex justify-between items-center">
                        <h3 className="font-headline-md text-headline-md text-on-surface">Top Candidates Leaderboard</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30">
                              <th className="p-2 font-label-mono text-label-mono text-on-surface-variant font-medium pl-4">Candidate</th>
                              <th className="p-2 font-label-mono text-label-mono text-on-surface-variant font-medium">Role</th>
                              <th className="p-2 font-label-mono text-label-mono text-on-surface-variant font-medium">AI Score</th>
                              <th className="p-2 font-label-mono text-label-mono text-on-surface-variant font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="font-body-sm text-body-sm">
                            {topCandidates.length === 0 ? (
                              <tr><td colSpan="4" className="p-4 text-center text-on-surface-variant">No candidates yet.</td></tr>
                            ) : topCandidates.map(c => (
                              <tr key={c.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                                <td className="p-2 pl-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold">{c.name.charAt(0)}</div>
                                    <div>
                                      <p className="font-semibold text-on-surface">{c.name}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2 text-on-surface-variant">{c.job_role}</td>
                                <td className="p-2">
                                  <div className="flex items-center gap-1">
                                    <span className="font-label-mono text-label-mono text-[#059669]">{c.score}</span>
                                    <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden"><div className="bg-[#059669] h-full" style={{ width: `${c.score}%` }}></div></div>
                                  </div>
                                </td>
                                <td className="p-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">{c.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-4 ambient-shadow">
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Quick Drop</h3>
                      <div onClick={() => setShowUploadModal(true)} className="border-2 border-dashed border-outline-variant rounded-lg p-6 text-center hover:border-secondary hover:bg-surface-container-low transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[160px]">
                        <span className="material-symbols-outlined text-[32px] text-on-surface-variant group-hover:text-secondary mb-1 transition-colors">cloud_upload</span>
                        <p className="font-body-md text-body-md text-on-surface font-medium">Click to screen candidate</p>
                        <div className="mt-2 pt-2 border-t border-outline-variant/30 w-full flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-[#8b5cf6]">psychology</span>
                          <span className="font-label-mono text-label-mono text-on-surface-variant text-[10px]">AI Auto-parse Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Applicants Tab */}
            {activeTab === 'applicants' && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl ambient-shadow overflow-hidden flex-1 flex flex-col">
                <div className="p-4 border-b border-outline-variant bg-surface flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="relative">
                      <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="appearance-none bg-surface-container-lowest border border-outline-variant text-on-surface py-1.5 pl-3 pr-8 rounded-lg font-body-sm text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none">
                        {rolesList.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[16px] text-on-surface-variant">arrow_drop_down</span>
                    </div>
                    <div className="relative">
                      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-surface-container-lowest border border-outline-variant text-on-surface py-1.5 pl-3 pr-8 rounded-lg font-body-sm text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none">
                        <option value="All">Status: All</option>
                        <option value="Pending">Pending</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[16px] text-on-surface-variant">arrow_drop_down</span>
                    </div>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
                    <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary font-body-sm text-body-sm" placeholder="Search in table..." type="text"/>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1 min-h-[400px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface sticky top-0 z-10 border-b border-outline-variant font-label-mono text-label-mono text-on-surface-variant uppercase">
                      <tr>
                        <th className="py-2 px-4 font-medium">Candidate</th>
                        <th className="py-2 px-4 font-medium">Applied Role</th>
                        <th className="py-2 px-4 font-medium">AI Score</th>
                        <th className="py-2 px-4 font-medium">Status</th>
                        <th className="py-2 px-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                      {filteredCandidates.map(c => (
                        <tr key={c.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-secondary font-bold text-[12px]">{c.name.charAt(0)}</div>
                              <div>
                                <div className="font-bold">{c.name}</div>
                                <div className="text-on-surface-variant font-body-sm text-body-sm">{c.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-4 font-medium text-on-surface-variant">{c.job_role}</td>
                          <td className="py-2 px-4">
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container text-secondary font-label-mono text-label-mono">
                              <span className="material-symbols-outlined text-[14px]">auto_awesome</span> {c.score}%
                            </div>
                          </td>
                          <td className="py-2 px-4" onClick={(e) => e.stopPropagation()}>
                            <select 
                              value={c.status} 
                              onChange={(e) => handleStatusChange(c.id, e.target.value)}
                              className="appearance-none bg-surface-container-lowest border border-outline-variant text-on-surface py-1 pl-2 pr-6 rounded-lg font-body-sm text-body-sm focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="py-2 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => handleDeleteCandidate(c.id, e)} className="text-on-surface-variant hover:text-error p-2 rounded-full hover:bg-error-container transition-colors" title="Delete Candidate">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">work</span> Add New Job Opening
                  </h2>
                  <form onSubmit={handleCreateJob} className="flex flex-col gap-4">
                    <div>
                      <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1">Job Posting Title</label>
                      <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"/>
                    </div>
                    <div>
                      <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1">Job Description Requirements</label>
                      <textarea value={jobDescText} onChange={(e) => setJobDescText(e.target.value)} required rows="6" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"/>
                    </div>
                    {jobMessage && <div className="text-[#059669] font-body-sm bg-[#ecfdf5] p-2 rounded border border-[#a7f3d0]">{jobMessage}</div>}
                    {jobError && <div className="text-error font-body-sm bg-error-container p-2 rounded">{jobError}</div>}
                    <button type="submit" disabled={savingJob} className="bg-secondary text-on-secondary py-2 rounded-lg font-bold hover:bg-secondary-container transition-colors disabled:opacity-50">
                      {savingJob ? 'Saving...' : 'Publish Job Opening'}
                    </button>
                  </form>
                </div>
                
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Active Job Openings</h2>
                  <div className="flex flex-col gap-4">
                    {jobs.map(j => (
                      <div key={j.id} className="border border-outline-variant rounded-lg p-4 bg-surface-container-low">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-on-surface">{j.title}</h3>
                          <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">ID: {j.id}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant truncate">{j.description_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="flex flex-col gap-6">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow text-center">
                  <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Reporting & Analytics</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">Generate compiled PDF reports of all candidates, scores, and recruitment funnels.</p>
                  <button onClick={handleDownloadReport} className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-bold hover:bg-secondary-container transition-colors shadow-md inline-flex items-center gap-2">
                    <span className="material-symbols-outlined">download</span> Generate Full PDF Report
                  </button>
                </div>
              </div>
            )}

            {/* ATS Matcher Tab */}
            {activeTab === 'ats' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-4">ATS Match Playground</h2>
                  <form onSubmit={handleAtsCheckSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1">Job Description</label>
                      <textarea value={atsJD} onChange={(e) => setAtsJD(e.target.value)} required rows="5" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"/>
                    </div>
                    <div>
                      <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1">Upload Resume (PDF/TXT)</label>
                      <input type="file" accept=".pdf,.txt" onChange={(e) => setAtsFile(e.target.files[0])} required className="w-full border border-dashed border-outline-variant rounded-lg p-4 font-body-md text-on-surface"/>
                    </div>
                    {atsError && <div className="text-error font-body-sm bg-error-container p-2 rounded">{atsError}</div>}
                    <button type="submit" disabled={atsChecking} className="bg-[#8b5cf6] text-white py-2 rounded-lg font-bold hover:bg-[#7c3aed] transition-colors disabled:opacity-50">
                      {atsChecking ? 'Analyzing...' : 'Calculate ATS Match Score'}
                    </button>
                  </form>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow ai-glow border-l-4 border-l-[#8b5cf6]">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Match Results</h2>
                  {atsResult ? (
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl font-bold text-[#8b5cf6]">{atsResult.ats_score}%</div>
                        <p className="text-on-surface-variant text-sm italic">{atsResult.match_summary}</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-bold text-on-surface text-sm mb-2">Matched Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {atsResult.matched_keywords.map(kw => <span key={kw} className="bg-[#ecfdf5] text-[#065f46] px-2 py-1 rounded text-xs">{kw}</span>)}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-sm mb-2">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {atsResult.missing_keywords.map(kw => <span key={kw} className="bg-error-container text-error px-2 py-1 rounded text-xs">{kw}</span>)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-on-surface-variant">Upload a resume and job description to see the ATS score analysis.</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-4">AI Model Parameters</h2>
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="flex justify-between font-body-md text-on-surface mb-1">
                        <span>Auto-Shortlist Score Threshold</span>
                        <span className="font-bold text-secondary">{settings.threshold}/100</span>
                      </label>
                      <input type="range" min="0" max="100" value={settings.threshold} onChange={(e) => setSettings(prev => ({ ...prev, threshold: parseInt(e.target.value, 10) }))} className="w-full"/>
                    </div>
                    <div>
                      <label className="block font-body-md text-on-surface mb-1">Ollama Screening Model</label>
                      <select value={settings.ollamaModel} onChange={(e) => setSettings(prev => ({ ...prev, ollamaModel: e.target.value }))} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 font-body-md text-on-surface">
                        <option value="llama3">Llama 3 (8B)</option>
                        <option value="mistral">Mistral (7B)</option>
                        <option value="phi3">Phi 3 (3.8B)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scheduler Tab */}
            {activeTab === 'scheduler' && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Interview Scheduler</h2>
                <div className="flex flex-col gap-4">
                  {candidates.filter(c => c.status === 'Shortlisted').map(c => (
                    <div key={c.id} className="border border-outline-variant rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low">
                      <div>
                        <h3 className="font-bold text-on-surface">{c.name}</h3>
                        <p className="text-sm text-on-surface-variant">{c.job_role} • Score: {c.score}</p>
                        {c.meet_link ? <p className="text-xs text-[#059669] mt-1 break-all">Meet: {c.meet_link}</p> : <p className="text-xs text-[#d97706] mt-1">No Meeting Set</p>}
                      </div>
                      <button onClick={() => { setSchedulingCandidateId(c.id); setMeetLink(c.meet_link || ''); setCalendarLink(c.meeting_link || ''); }} className="bg-surface-container border border-outline-variant text-on-surface px-4 py-2 rounded-lg font-bold hover:bg-surface-container-highest transition-colors text-sm shrink-0">
                        Edit Schedule
                      </button>
                    </div>
                  ))}
                  {candidates.filter(c => c.status === 'Shortlisted').length === 0 && <p className="text-on-surface-variant">No shortlisted candidates to schedule.</p>}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Screen New Candidate Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-[512px] ambient-shadow" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display-lg text-2xl text-on-surface font-bold">Screen Candidate</h3>
              <button className="text-on-surface-variant hover:text-error" onClick={() => setShowUploadModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface">Link to Job Opening (Optional)</label>
                <select 
                  value={selectedJobId} 
                  onChange={(e) => {
                    setSelectedJobId(e.target.value);
                    const job = jobs.find(j => j.id.toString() === e.target.value);
                    if (job) setJobRole(job.title);
                  }}
                  className="w-full border border-outline-variant rounded-lg p-2 bg-surface-container-lowest text-on-surface"
                >
                  <option value="">-- No linked JD --</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>

              <input type="text" placeholder="Target Job Role (e.g. Software Engineer)" value={jobRole} onChange={(e) => setJobRole(e.target.value)} required className="w-full border border-outline-variant rounded-lg p-2 bg-surface-container-lowest" />
              <input type="file" id="file-input" accept=".pdf,.txt" multiple onChange={(e) => setFiles(Array.from(e.target.files))} required className="w-full border border-dashed border-outline-variant rounded-lg p-4 bg-surface-container-lowest" />
              
              {uploadMessage && <div className="text-[#059669] text-sm bg-[#ecfdf5] p-2 rounded">{uploadMessage}</div>}
              {uploadError && <div className="text-error text-sm bg-error-container p-2 rounded">{uploadError}</div>}
              
              <button type="submit" disabled={uploading} className="bg-secondary text-on-secondary py-3 rounded-lg font-bold hover:bg-secondary-container transition-colors disabled:opacity-50 mt-2">
                {uploading ? uploadMessage || `Analyzing...` : 'Run AI Screener'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Detail Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end backdrop-blur-sm" onClick={() => setSelectedCandidate(null)}>
          <div className="bg-surface-container-lowest w-full max-w-[448px] h-full overflow-y-auto p-6 ambient-shadow transform transition-transform" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display-lg text-2xl text-on-surface font-bold">{selectedCandidate.name}</h3>
                <p className="text-on-surface-variant font-medium">{selectedCandidate.job_role}</p>
              </div>
              <button className="text-on-surface-variant hover:text-error bg-surface-container-low rounded-full p-1" onClick={() => setSelectedCandidate(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between border-l-4 border-l-secondary">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">AI Screening Score</p>
                  <p className="text-3xl font-bold text-on-surface">{selectedCandidate.score}<span className="text-lg text-on-surface-variant font-normal">/100</span></p>
                </div>
                <span className="bg-[#dcfce7] text-[#166534] px-3 py-1 rounded-full text-sm font-bold border border-[#bbf7d0]">{selectedCandidate.status}</span>
              </div>

              <div>
                <h4 className="font-bold text-on-surface mb-2">AI Summary Reason</h4>
                <p className="text-sm text-on-surface-variant italic border-l-2 border-outline-variant pl-3">{selectedCandidate.reason}</p>
              </div>

              <div>
                <h4 className="font-bold text-on-surface mb-2">Skills Matched</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills_matched.length > 0 ? selectedCandidate.skills_matched.map(s => <span key={s} className="bg-[#ecfdf5] text-[#065f46] px-2 py-1 rounded text-xs">{s}</span>) : <span className="text-xs text-on-surface-variant">None</span>}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-on-surface mb-2">Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.missing_skills.length > 0 ? selectedCandidate.missing_skills.map(s => <span key={s} className="bg-error-container text-error px-2 py-1 rounded text-xs">{s}</span>) : <span className="text-xs text-on-surface-variant">None</span>}
                </div>
              </div>
              
              <div className="border-t border-outline-variant pt-4 mt-2">
                <h4 className="font-bold text-on-surface mb-2">Resume Extract</h4>
                <pre className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-64">{selectedCandidate.resume_text}</pre>
              </div>

              <div className="border-t border-outline-variant pt-4 mt-2 flex justify-end gap-2">
                <a 
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedCandidate.email}&su=Interview Invitation: ${selectedCandidate.job_role}&body=Hi ${selectedCandidate.name},%0D%0A%0D%0AWe are very impressed by your background and would like to invite you to an interview for the ${selectedCandidate.job_role} position.%0D%0A%0D%0APlease let us know your availability over the next few days.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">mail</span> Email Candidate
                </a>
                <button 
                  onClick={() => handleDeleteCandidate(selectedCandidate.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-error-container text-error rounded-lg font-bold hover:bg-[#fecdd3] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span> Delete Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Edit Modal */}
      {schedulingCandidateId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSchedulingCandidateId(null)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-[384px] ambient-shadow" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 text-on-surface">Set Interview Links</h3>
            <form onSubmit={handleScheduleMeetingSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Google Meet URL</label>
                <input type="url" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} required className="w-full border border-outline-variant rounded-lg p-2 bg-surface-container-lowest text-sm" />
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Calendar URL (Optional)</label>
                <input type="url" value={calendarLink} onChange={(e) => setCalendarLink(e.target.value)} className="w-full border border-outline-variant rounded-lg p-2 bg-surface-container-lowest text-sm" />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setSchedulingCandidateId(null)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg text-sm font-bold">Cancel</button>
                <button type="submit" disabled={scheduling} className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
