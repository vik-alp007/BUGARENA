import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { challengesApi } from '../api/client.js';
import { getSimulationComponent } from '../challenges/ChallengeRegistry.jsx';
import { DifficultyBadge, StatusBadge } from '../components/Badge.jsx';
import { AssistantModal } from '../components/AssistantModal.jsx';
import {
  Terminal,
  Play,
  RotateCcw,
  FileText,
  Bot,
  Copy,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Search,
  ExternalLink,
  Zap,
  Sliders
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

export const GlitchLabPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { info, success } = useToast();

  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState(
    searchParams.get('challenge') || 'sorting-glitch'
  );
  const [logs, setLogs] = useState([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const consoleEndRef = useRef(null);

  // Fetch all challenges
  useEffect(() => {
    challengesApi.getAll()
      .then((res) => {
        if (res.challenges) setChallenges(res.challenges);
      })
      .catch((err) => console.warn('Could not fetch challenges:', err.message));
  }, []);

  // Sync selected challenge with URL query param
  useEffect(() => {
    const urlChallenge = searchParams.get('challenge');
    if (urlChallenge && urlChallenge !== selectedChallengeId) {
      setSelectedChallengeId(urlChallenge);
    }
  }, [searchParams]);

  // Record attempt in backend when user switches challenge
  useEffect(() => {
    if (selectedChallengeId) {
      challengesApi.recordAttempt(selectedChallengeId).catch(() => {});
      // Add initial lab log
      const time = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        `[${time}] [LAB_INIT] Loaded sandbox environment for challenge: ${selectedChallengeId}`
      ]);
    }
  }, [selectedChallengeId]);

  // Log auto-scroll
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const activeChallenge = challenges.find((c) => c.challengeId === selectedChallengeId) || {
    challengeId: selectedChallengeId,
    title: 'Glitch Lab Sandbox',
    difficulty: 'easy',
    points: 10,
    category: 'Simulation',
    instructions: 'Follow instructions to discover and reproduce the bug.'
  };

  const ActiveSimulation = getSimulationComponent(selectedChallengeId);

  const handleLogEvent = useCallback((event) => {
    const time = new Date().toLocaleTimeString();
    const formatted = `[${time}] [${event.type}] ${JSON.stringify(event)}`;
    setLogs((prev) => [...prev.slice(-40), formatted]);
  }, []);

  const handleSelectChallenge = (id) => {
    setSelectedChallengeId(id);
    setSearchParams({ challenge: id });
    setResetKey((k) => k + 1);
  };

  const handleResetSimulation = () => {
    setResetKey((k) => k + 1);
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] [SYSTEM] Reset simulation container to clean state.`]);
    info('Simulation state restored to baseline.');
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    success('Telemetry logs copied to clipboard.');
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleFileReport = () => {
    // Navigate to report submission prefilled with challenge & recent logs as evidence
    const recentLogs = logs.slice(-10).join('\n');
    navigate(`/submit-report?challenge=${selectedChallengeId}`, {
      state: { evidenceText: recentLogs }
    });
  };

  // Filtered challenges list for selector sidebar
  const visibleChallenges = challenges.filter((c) => {
    const matchDiff = filterDifficulty === 'all' || c.difficulty === filterDifficulty;
    const matchSearch = c.title.toLowerCase().includes(filterSearch.toLowerCase());
    return matchDiff && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4.5rem)' }}>
      {/* Glitch Lab Workspace Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        height: '100%',
        overflow: 'hidden'
      }} className="lab-grid">

        {/* Left Sidebar: Challenge Selector */}
        <aside style={{
          background: '#090d1c',
          borderRight: '1px solid var(--border-dim)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }} className="lab-sidebar">
          {/* Sidebar Header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-dim)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00f0ff', marginBottom: '0.5rem' }}>
              <Terminal size={18} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>GLITCH LAB</h3>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
              {['all', 'easy', 'medium', 'hard'].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDifficulty(d)}
                  style={{
                    flex: 1,
                    padding: '0.2rem 0',
                    fontSize: '0.7rem',
                    textTransform: 'capitalize',
                    background: filterDifficulty === d ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: filterDifficulty === d ? '#00f0ff' : '#94a3b8',
                    border: '1px solid ' + (filterDifficulty === d ? 'rgba(0, 240, 255, 0.4)' : 'transparent'),
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Filter challenges..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.6rem 0.4rem 1.8rem',
                  fontSize: '0.785rem',
                  background: '#060914',
                  border: '1px solid var(--border-dim)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Challenge List Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {visibleChallenges.map((c) => {
              const isSelected = c.challengeId === selectedChallengeId;
              return (
                <button
                  key={c.challengeId}
                  onClick={() => handleSelectChallenge(c.challengeId)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    marginBottom: '0.35rem',
                    background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                    border: '1px solid ' + (isSelected ? '#00f0ff' : 'transparent'),
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: c.difficulty === 'easy' ? '#10b981' : c.difficulty === 'medium' ? '#f59e0b' : '#f43f5e'
                    }}>
                      {c.difficulty.toUpperCase()} • {c.points} PTS
                    </span>
                    {c.status === 'solved' && (
                      <span style={{ fontSize: '0.7rem', color: '#10b981' }}>✓ Solved</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                    {c.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {c.category}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Area: Simulation Workbench & Live Terminal */}
        <main style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          background: 'var(--bg-dark)'
        }}>
          {/* Top Workbench Action Bar */}
          <div style={{
            padding: '0.85rem 1.5rem',
            background: '#0c1022',
            borderBottom: '1px solid var(--border-dim)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff' }}>
                {activeChallenge.title}
              </h2>
              <DifficultyBadge difficulty={activeChallenge.difficulty} />
              <span className="badge badge-purple">{activeChallenge.category}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={handleResetSimulation}
                className="btn btn-secondary btn-sm"
                title="Reset simulation state"
              >
                <RotateCcw size={14} /> Reset State
              </button>

              <button
                onClick={() => setAssistantOpen(true)}
                className="btn btn-outline-cyan btn-sm"
                title="Consult GlitchAssist Copilot"
              >
                <Bot size={14} /> GlitchAssist
              </button>

              <button
                onClick={handleFileReport}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FileText size={14} /> File Bug Report
              </button>
            </div>
          </div>

          {/* Active Sandbox Interactive Workspace */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Simulation Instructions Reminder Pill */}
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: '#090e1f',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>OBJECTIVE</span>
                <span>Discover the intentional flaw and capture reproduction evidence.</span>
              </div>
              <Link
                to={`/challenges/${selectedChallengeId}`}
                style={{ color: '#00f0ff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                View Hints & Rules <ExternalLink size={12} />
              </Link>
            </div>

            {/* Interactive Simulation Frame */}
            <div key={resetKey} className="card" style={{ padding: '1.5rem', background: '#0e1428' }}>
              {ActiveSimulation ? (
                <ActiveSimulation onLogEvent={handleLogEvent} />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  Select a challenge from the sidebar to launch its interactive simulation container.
                </div>
              )}
            </div>
          </div>

          {/* Glitch Lab Telemetry Console (Docked Terminal at bottom) */}
          <div style={{
            height: '180px',
            borderTop: '1px solid rgba(0, 240, 255, 0.25)',
            background: '#05070e',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Terminal Header */}
            <div style={{
              padding: '0.4rem 1rem',
              background: '#090d1a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="terminal-dots">
                  <div className="terminal-dot dot-red" />
                  <div className="terminal-dot dot-yellow" />
                  <div className="terminal-dot dot-green" />
                </div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#00f0ff', fontWeight: 600 }}>
                  GLITCH LAB TELEMETRY & EVENT STREAM ({logs.length} events logged)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={handleCopyLogs}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                  title="Copy logs for bug report evidence"
                >
                  <Copy size={11} /> Copy Evidence
                </button>
                <button
                  onClick={handleClearLogs}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                  title="Clear telemetry logs"
                >
                  <Trash2 size={11} /> Clear
                </button>
              </div>
            </div>

            {/* Terminal Log Output */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.6rem 1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#38bdf8',
              lineHeight: 1.45
            }}>
              {logs.map((logLine, idx) => (
                <div key={idx} style={{
                  marginBottom: '0.2rem',
                  color: logLine.includes('VULNERABILITY') || logLine.includes('DEADLOCK') || logLine.includes('Anomaly') ? '#f43f5e' :
                         logLine.includes('Fixed') || logLine.includes('MUTEX_BLOCKED') ? '#10b981' : '#38bdf8'
                }}>
                  {logLine}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </div>
        </main>
      </div>

      {/* Assistant Modal */}
      <AssistantModal
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        challengeId={selectedChallengeId}
        challengeTitle={activeChallenge.title}
      />

      <style>{`
        @media (max-width: 860px) {
          .lab-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto 1fr !important;
          }
          .lab-sidebar {
            height: 180px !important;
            border-bottom: 1px solid var(--border-dim);
            border-right: none !important;
          }
        }
      `}</style>
    </div>
  );
};
