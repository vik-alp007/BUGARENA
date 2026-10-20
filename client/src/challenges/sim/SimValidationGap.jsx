import React, { useState } from 'react';
import { UserCheck, AlertCircle, PlusCircle, CheckCircle2 } from 'lucide-react';

const INITIAL_TEAMS = [
  { id: 1, name: 'CyberKnights', size: 3, leader: 'Alice' },
  { id: 2, name: 'ZeroDay Exploits', size: 4, leader: 'Bob' }
];

export const SimValidationGap = ({ onLogEvent }) => {
  const [teams, setTeams] = useState([...INITIAL_TEAMS]);
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState('2');
  const [leader, setLeader] = useState('');
  const [error, setError] = useState('');
  const [lastSubmitted, setLastSubmitted] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // INTENTIONAL REPRODUCIBLE BUG: Inadequate validation check!
    // Checks that teamSize is not empty string, but does NOT enforce positive integer in range [1, 4]!
    if (!teamName.trim()) {
      setError('Team name is required.');
      return;
    }

    if (teamSize === '') {
      setError('Team size is required.');
      return;
    }

    // Notice: Missing checks for: Number(teamSize) > 0, Number.isInteger(), teamSize <= 4, etc.
    const newTeam = {
      id: Date.now(),
      name: teamName.trim(),
      size: teamSize, // Preserves raw input (including negative, float, scientific notation)
      leader: leader.trim() || 'Anonymous Lead'
    };

    setTeams((prev) => [newTeam, ...prev]);
    setLastSubmitted(newTeam);
    setTeamName('');
    setTeamSize('2');
    setLeader('');

    onLogEvent?.({
      type: 'TEAM_REGISTERED',
      payload: newTeam,
      warning: Number(teamSize) < 1 || Number(teamSize) > 4 ? 'VULNERABILITY TRIGGERED: Invalid team size accepted by frontend validator!' : null
    });
  };

  const handleReset = () => {
    setTeams([...INITIAL_TEAMS]);
    setLastSubmitted(null);
    setError('');
    onLogEvent?.({ type: 'RESET_STATE', message: 'Restored initial registered teams.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Registration Form */}
      <form onSubmit={handleSubmit} style={{
        padding: '1.25rem 1.5rem',
        background: '#0a0f22',
        borderRadius: '10px',
        border: '1px solid var(--border-dim)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserCheck size={18} color="#00f0ff" />
            Hackathon Squad Enrollment Portal
          </h4>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Allowed size: 1–4 members
          </span>
        </div>

        {error && (
          <div style={{
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#f43f5e',
            fontSize: '0.825rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Team Name *</label>
            <input
              type="text"
              placeholder="e.g. RedTeam Echo"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Team Size (Members) *</label>
            <input
              type="text"
              placeholder="e.g. -2, 0, 3e2, or 2"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="form-input"
              style={{
                borderColor: Number(teamSize) < 1 || Number(teamSize) > 4 ? '#f43f5e' : 'var(--border-dim)'
              }}
            />
          </div>

          <div>
            <label className="form-label">Team Leader Handle</label>
            <input
              type="text"
              placeholder="@handle"
              value={leader}
              onChange={(e) => setLeader(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Enroll Team
          </button>
          <button type="button" onClick={handleReset} className="btn btn-secondary btn-sm">
            Reset Teams
          </button>
        </div>
      </form>

      {/* Accepted Payload Notification */}
      {lastSubmitted && (
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: '8px',
          background: Number(lastSubmitted.size) < 1 || Number(lastSubmitted.size) > 4 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: '1px solid ' + (Number(lastSubmitted.size) < 1 || Number(lastSubmitted.size) > 4 ? '#f43f5e' : '#10b981'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color={Number(lastSubmitted.size) < 1 || Number(lastSubmitted.size) > 4 ? '#f43f5e' : '#10b981'} />
            <span style={{ fontSize: '0.85rem', color: '#ffffff' }}>
              Enrolled: <strong>{lastSubmitted.name}</strong> with Size: <code style={{ color: '#00f0ff' }}>{lastSubmitted.size}</code>
            </span>
          </div>
          {Number(lastSubmitted.size) < 1 || Number(lastSubmitted.size) > 4 ? (
            <span className="badge badge-hard" style={{ fontSize: '0.7rem' }}>Anomaly: Size Out of Range</span>
          ) : (
            <span className="badge badge-easy" style={{ fontSize: '0.7rem' }}>Valid Size</span>
          )}
        </div>
      )}

      {/* Enrolled Teams List */}
      <div>
        <h5 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Simulated Registered Database ({teams.length} Teams)
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.6rem' }}>
          {teams.map((t) => (
            <div
              key={t.id}
              style={{
                padding: '0.75rem',
                background: '#0d1326',
                borderRadius: '6px',
                border: '1px solid ' + (Number(t.size) < 1 || Number(t.size) > 4 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(255, 255, 255, 0.06)')
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.875rem' }}>{t.name}</span>
                <span className={`badge ${Number(t.size) < 1 || Number(t.size) > 4 ? 'badge-hard' : 'badge-cyan'}`} style={{ fontSize: '0.7rem' }}>
                  Size: {t.size}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Leader: {t.leader}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
