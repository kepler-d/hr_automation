import React, { useState, useEffect } from 'react';

// Backend API URL configuration (relying on host routing or fallback)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Selected Candidate Drawer
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Job Descriptions State
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescText, setJobDescText] = useState('');
  const [savingJob, setSavingJob] = useState(false);
  const [jobMessage, setJobMessage] = useState(null);
  const [jobError, setJobError] = useState(null);

  // Navigation State
  const [activeTab, setActiveTab] = useState('hr'); // 'hr' or 'ats'

  // ATS Checker State (Candidate-facing Playground)
  const [atsJD, setAtsJD] = useState('');
  const [atsFile, setAtsFile] = useState(null);
  const [atsChecking, setAtsChecking] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsError, setAtsError] = useState(null);
  
  // Fetch Candidates from API
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

  // Fetch Job Descriptions from API
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

  // Handle File Upload & Screen
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!jobRole.trim()) {
      setUploadError('Please specify a Job Role Target.');
      return;
    }
    if (!file) {
      setUploadError('Please select a resume file (PDF or TXT).');
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    setUploadMessage(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('job_role', jobRole);
    if (selectedJobId) {
      formData.append('job_description_id', selectedJobId);
    }
    
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to process resume.');
      }
      
      const result = await res.json();
      setUploadMessage(`Success! ${name} screened with a score of ${result.score}/100. Status: ${result.status}`);
      
      // Reset Form fields
      setName('');
      setEmail('');
      setPhone('');
      setFile(null);
      // Reset file input element
      document.getElementById('file-input').value = '';
      
      // Refresh list
      fetchCandidates();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Create Job Description handler
  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescText.trim()) {
      setJobError('Please fill in both the Job Title and Job Description.');
      return;
    }
    setSavingJob(true);
    setJobError(null);
    setJobMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: jobTitle,
          description_text: jobDescText,
        }),
      });
      if (!res.ok) throw new Error('Failed to create job description.');
      const data = await res.json();
      setJobMessage(`Job "${data.title}" created successfully!`);
      setJobTitle('');
      setJobDescText('');
      fetchJobs();
    } catch (err) {
      setJobError(err.message);
    } finally {
      setSavingJob(false);
    }
  };

  // ATS Checker Form handler
  const handleAtsCheckSubmit = async (e) => {
    e.preventDefault();
    if (!atsFile) {
      setAtsError('Please select your resume file (PDF or TXT).');
      return;
    }
    if (!atsJD.trim()) {
      setAtsError('Please paste the Job Description requirements.');
      return;
    }
    setAtsChecking(true);
    setAtsError(null);
    setAtsResult(null);

    const formData = new FormData();
    formData.append('file', atsFile);
    formData.append('job_description', atsJD);

    try {
      const res = await fetch(`${API_URL}/api/ats-check`, {
        method: 'POST',
        body: formData,
      });

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

  // Toggle Shortlist/Reject Status
  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      
      const res = await fetch(`${API_URL}/api/candidates/${candidateId}/status`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Failed to update status.');
      
      // Update local state
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
      
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Trigger Weekly Report PDF Download
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

  // Stats Calculations
  const totalCount = candidates.length;
  const shortlistCount = candidates.filter(c => c.status === 'Shortlisted').length;
  const shortlistPct = totalCount > 0 ? ((shortlistCount / totalCount) * 100).toFixed(1) : '0.0';
  const averageScore = totalCount > 0 
    ? (candidates.reduce((sum, c) => sum + c.score, 0) / totalCount).toFixed(1) 
    : '0.0';

  const linkedJob = selectedCandidate && jobs.find(j => j.id === selectedCandidate.job_description_id);

  // Role list for filters
  const roles = ['All', ...new Set(candidates.map(c => c.job_role))];

  // Filtering candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || c.job_role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="app-container">
      {/* Sidebar Header */}
      <header className="app-header">
        <div className="header-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h1>HR AI Screener</h1>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleDownloadReport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export PDF Report
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="app-tabs">
        <button 
          className={`tab-btn ${activeTab === 'hr' ? 'active' : ''}`}
          onClick={() => setActiveTab('hr')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          HR Control Center
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ats' ? 'active' : ''}`}
          onClick={() => setActiveTab('ats')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Candidate ATS Checker
        </button>
      </nav>

      {activeTab === 'hr' && (
        <>
          {/* KPI Stats Ribbon */}
          <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon logo-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Applicants</span>
            <span className="stat-val">{totalCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon logo-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Shortlist Rate</span>
            <span className="stat-val">{shortlistPct}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon logo-gold">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Average AI Score</span>
            <span className="stat-val">{averageScore}</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Upload Forms + Candidates List */}
      <main className="dashboard-main">
        <div className="sidebar-column">
          {/* Upload Form Block */}
          <section className="form-section card">
            <h2>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 12 15 15" />
              </svg>
              Screen New Candidate
            </h2>
            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Alice Smith" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. alice@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. +1234567890" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Target Job Description (Optional)</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedJobId(id);
                    if (id) {
                      const selected = jobs.find(j => j.id === parseInt(id));
                      if (selected) {
                        setJobRole(selected.title);
                      }
                    } else {
                      setJobRole('');
                    }
                  }}
                >
                  <option value="">-- None (Generic Target Role) --</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Job Role Target</label>
                <input 
                  type="text" 
                  placeholder="e.g. Software Engineer" 
                  value={jobRole} 
                  onChange={(e) => setJobRole(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Upload Resume File (PDF / TXT)</label>
                <div className="file-drop-zone">
                  <input 
                    id="file-input"
                    type="file" 
                    accept=".pdf,.txt"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                  <div className="drop-zone-content">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{file ? file.name : "Drag & drop file or click to browse"}</span>
                  </div>
                </div>
              </div>

              {uploadMessage && <div className="alert success">{uploadMessage}</div>}
              {uploadError && <div className="alert danger">{uploadError}</div>}

              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? (
                  <>
                    <span className="spinner"></span>
                    Processing with AI...
                  </>
                ) : (
                  "Upload and Run Screener"
                )}
              </button>
            </form>
          </section>

          {/* Job Description Manager Block */}
          <section className="form-section card jd-manager-card">
            <h2>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              Manage Job Openings
            </h2>
            
            <form onSubmit={handleCreateJob}>
              <div className="form-group">
                <label>Job Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Frontend Developer" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Job Description & Requirements</label>
                <textarea 
                  placeholder="Paste the job description details, key skills, and experience requirements here..." 
                  value={jobDescText} 
                  onChange={(e) => setJobDescText(e.target.value)} 
                  required 
                  rows="4"
                  className="jd-textarea"
                />
              </div>

              {jobMessage && <div className="alert success">{jobMessage}</div>}
              {jobError && <div className="alert danger">{jobError}</div>}

              <button type="submit" className="btn-primary" disabled={savingJob}>
                {savingJob ? (
                  <>
                    <span className="spinner"></span>
                    Saving Job...
                  </>
                ) : (
                  "Save Job Description"
                )}
              </button>
            </form>

            <div className="jd-list-section">
              <h3>Active Job Openings ({jobs.length})</h3>
              {jobs.length === 0 ? (
                <p className="no-jds-text">No job openings created yet.</p>
              ) : (
                <div className="jd-list">
                  {jobs.map(j => (
                    <div key={j.id} className="jd-list-item">
                      <div className="jd-item-header">
                        <strong>{j.title}</strong>
                        <span className="jd-id-tag">ID: {j.id}</span>
                      </div>
                      <p className="jd-item-snippet">
                        {j.description_text.length > 80 
                          ? `${j.description_text.substring(0, 80)}...` 
                          : j.description_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Datagrid Candidate Table */}
        <section className="table-section card">
          <div className="table-filters">
            <h2>Screened Candidates</h2>
            <div className="filter-controls">
              <input 
                type="text" 
                placeholder="Search candidates..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner large"></span>
              <p>Loading candidate list...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button className="btn-secondary" onClick={fetchCandidates}>Retry</button>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="empty-state">
              <p>No candidates match the selected filters.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="candidate-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Target Role</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map(c => {
                    const isPassed = c.score >= 65;
                    return (
                      <tr key={c.id} className="candidate-row" onClick={() => setSelectedCandidate(c)}>
                        <td>
                          <div className="candidate-info">
                            <strong>{c.name}</strong>
                            <span>{c.email}</span>
                          </div>
                        </td>
                        <td>{c.job_role}</td>
                        <td>
                          <span className={`score-badge ${isPassed ? 'pass' : 'fail'}`}>
                            {c.score}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select 
                            value={c.status} 
                            onChange={(e) => handleStatusChange(c.id, e.target.value)}
                            className={`status-select ${c.status.toLowerCase()}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button className="btn-icon" onClick={() => setSelectedCandidate(c)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      </>
      )}

      {activeTab === 'ats' && (
        <main className="dashboard-main ats-playground-main">
          {/* ATS Checker Form Card */}
          <section className="form-section card ats-form-card">
            <h2>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              ATS Match Playground
            </h2>
            <form onSubmit={handleAtsCheckSubmit}>
              <div className="form-group">
                <label>Job Description Requirements</label>
                <textarea 
                  placeholder="Paste the Job Description requirements here..." 
                  value={atsJD} 
                  onChange={(e) => setAtsJD(e.target.value)} 
                  required 
                  rows="6"
                  className="jd-textarea"
                />
              </div>

              <div className="form-group">
                <label>Upload Your Resume (PDF / TXT)</label>
                <div className="file-drop-zone">
                  <input 
                    id="ats-file-input"
                    type="file" 
                    accept=".pdf,.txt"
                    onChange={(e) => setAtsFile(e.target.files[0])}
                    required
                  />
                  <div className="drop-zone-content">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{atsFile ? atsFile.name : "Drag & drop file or click to browse"}</span>
                  </div>
                </div>
              </div>

              {atsError && <div className="alert danger">{atsError}</div>}

              <button type="submit" className="btn-primary" disabled={atsChecking}>
                {atsChecking ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing ATS Match...
                  </>
                ) : (
                  "Calculate ATS Match Score"
                )}
              </button>
            </form>
          </section>

          {/* ATS Results Card */}
          <section className="table-section card ats-results-card">
            <h2>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              ATS Match Analysis
            </h2>

            {atsResult ? (
              <div className="ats-results-wrapper">
                <div className="ats-score-badge-container">
                  <div className={`ats-score-ring ${atsResult.ats_score >= 80 ? 'good' : atsResult.ats_score >= 50 ? 'warning' : 'poor'}`}>
                    <span className="ats-score-num">{atsResult.ats_score}</span>
                    <span className="ats-score-label">Match Score</span>
                  </div>
                  <div className="ats-summary-container">
                    <h3>Analysis Summary</h3>
                    <p className="ats-summary-text">"{atsResult.match_summary}"</p>
                  </div>
                </div>

                <div className="ats-keywords-grid">
                  <div className="keywords-block">
                    <h4>Matched Keywords ({atsResult.matched_keywords.length})</h4>
                    {atsResult.matched_keywords.length > 0 ? (
                      <div className="keywords-tags">
                        {atsResult.matched_keywords.map((kw, i) => (
                          <span key={i} className="kw-tag kw-matched">{kw}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="no-keywords">No matched keywords found.</p>
                    )}
                  </div>

                  <div className="keywords-block">
                    <h4>Missing Keywords ({atsResult.missing_keywords.length})</h4>
                    {atsResult.missing_keywords.length > 0 ? (
                      <div className="keywords-tags">
                        {atsResult.missing_keywords.map((kw, i) => (
                          <span key={i} className="kw-tag kw-missing">{kw}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="no-keywords">No missing keywords identified.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="ats-empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <p>Upload your resume and paste a job description on the left to calculate your real-time ATS match analysis.</p>
              </div>
            )}
          </section>
        </main>
      )}

      {/* Candidate Details Modal/Drawer */}
      {selectedCandidate && (
        <div className="drawer-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Candidate Evaluation Profile</h3>
              <button className="btn-close" onClick={() => setSelectedCandidate(null)}>&times;</button>
            </div>
            
            <div className="drawer-body">
              <div className="profile-header">
                <h2>{selectedCandidate.name}</h2>
                <span className="profile-role">{selectedCandidate.job_role}</span>
                <div className="profile-meta">
                  <span><strong>Email:</strong> {selectedCandidate.email}</span>
                  {selectedCandidate.phone && <span><strong>Phone:</strong> {selectedCandidate.phone}</span>}
                  <span><strong>Screened:</strong> {new Date(selectedCandidate.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              {linkedJob && (
                <div className="details-section job-spec-section">
                  <h4>Target Job Description</h4>
                  <div className="job-spec-details">
                    <h5>{linkedJob.title}</h5>
                    <p className="job-spec-text">{linkedJob.description_text}</p>
                  </div>
                </div>
              )}

              <div className="score-section">
                <div className="score-main">
                  <span className={`score-large ${selectedCandidate.score >= 65 ? 'pass' : 'fail'}`}>
                    {selectedCandidate.score}
                  </span>
                  <div>
                    <h4>Overall Screener Score</h4>
                    <span className={`status-pill ${selectedCandidate.status.toLowerCase()}`}>
                      {selectedCandidate.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4>Evaluation Summary & Reason</h4>
                <p>{selectedCandidate.reason}</p>
              </div>

              <div className="skills-tags-container">
                <div className="skills-block">
                  <h4>Matched Skills</h4>
                  {selectedCandidate.skills_matched.length > 0 ? (
                    <div className="skills-grid">
                      {selectedCandidate.skills_matched.map(s => (
                        <span key={s} className="pill pill-green">{s}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="no-skills">No matched skills identified.</p>
                  )}
                </div>

                <div className="skills-block">
                  <h4>Missing Skills / Suggested Actions</h4>
                  {selectedCandidate.missing_skills.length > 0 ? (
                    <div className="skills-grid">
                      {selectedCandidate.missing_skills.map(s => (
                        <span key={s} className="pill pill-orange">{s}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="no-skills">No missing skills reported.</p>
                  )}
                </div>
              </div>

              {selectedCandidate.status === 'Shortlisted' && (selectedCandidate.meet_link || selectedCandidate.meeting_link) && (
                <div className="booking-section">
                  <h4>Interview Schedules</h4>
                  {selectedCandidate.meet_link && (
                    <p><strong>Google Meet:</strong> <a href={selectedCandidate.meet_link} target="_blank" rel="noreferrer">{selectedCandidate.meet_link}</a></p>
                  )}
                  {selectedCandidate.meeting_link && (
                    <p><strong>Calendar Event:</strong> <a href={selectedCandidate.meeting_link} target="_blank" rel="noreferrer">Open Invitation Event</a></p>
                  )}
                </div>
              )}

              <div className="resume-text-view">
                <h4>Extracted Resume Text</h4>
                <pre>{selectedCandidate.resume_text}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
