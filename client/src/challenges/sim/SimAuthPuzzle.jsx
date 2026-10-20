import React, { useState } from 'react';
import { KeyRound, Lock, Unlock, ShieldAlert, Terminal, CheckCircle2, RefreshCw } from 'lucide-react';

export const SimAuthPuzzle = ({ onLogEvent }) => {
  const [mockRole, setMockRole] = useState('student');
  const [mockToken, setMockToken] = useState('synth_token_eyJhbGciOiJub25lIn0.eyJyb2xlIjoic3R1ZGVudCJ9');
  const [activeTab, setActiveTab] = useState('app');

  // INTENTIONAL REPRODUCIBLE FLAW IN SYNTHETIC MOCK APP:
  // The mock sandbox trusts the unverified client-side header / state variable `mockRole === 'admin'`.
  const isSyntheticAdmin = mockRole.toLowerCase() === 'admin';

  const handleRoleChange = (newRole) => {
    setMockRole(newRole);
    setMockToken(`synth_token_eyJhbGciOiJub25lIn0.eyJyb2xlIjoi${newRole.toLowerCase()}\"}`);

    onLogEvent?.({
      type: 'SYNTHETIC_HEADER_MODIFIED',
      header: 'X-Synthetic-Role',
      value: newRole,
      accessGranted: newRole.toLowerCase() === 'admin'
    });
  };

  const handleReset = () => {
    setMockRole('student');
    setMockToken('synth_token_eyJhbGciOiJub25lIn0.eyJyb2xlIjoic3R1ZGVudCJ9');
    onLogEvent?.({ type: 'RESET_STATE', message: 'Restored unprivileged student observer role.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Simulation Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        border: '1px solid var(--border-dim)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <KeyRound size={16} color="#00f0ff" />
          <span>Synthetic Sandboxed Role: </span>
          <span className={`badge ${isSyntheticAdmin ? 'badge-hard' : 'badge-cyan'}`}>
            {mockRole.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => setActiveTab('app')}
              className={`btn btn-sm ${activeTab === 'app' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Simulated App UI
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={`btn btn-sm ${activeTab === 'inspector' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Mock Headers & Storage
            </button>
          </div>
          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} /> Reset Mock Auth
          </button>
        </div>
      </div>

      {activeTab === 'app' ? (
        /* Mock Portal View */
        <div style={{
          padding: '1.5rem',
          background: '#090e22',
          borderRadius: '10px',
          border: '1px solid ' + (isSyntheticAdmin ? '#00f0ff' : 'var(--border-dim)')
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', color: '#ffffff' }}>
                Synthetic Campus Vault Portal (Mock Sandbox)
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Current Mock Session: <code>observer_cadet@isolated.lab</code>
              </p>
            </div>
            {isSyntheticAdmin ? (
              <span className="badge badge-hard" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Unlock size={13} /> Admin Bypass Active
              </span>
            ) : (
              <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Lock size={13} /> Restricted Student Access
              </span>
            )}
          </div>

          {isSyntheticAdmin ? (
            /* Unlocked Admin Console */
            <div style={{
              padding: '1.25rem',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid #00f0ff',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00f0ff', fontWeight: 700 }}>
                <CheckCircle2 size={18} />
                Synthetic Privileged Admin Console Unlocked!
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Synthetic Flag Uncovered:
              </p>
              <pre style={{
                background: '#050814',
                padding: '0.75rem',
                borderRadius: '6px',
                color: '#34d399',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem'
              }}>
                FLAG&#123;SYNTHETIC_CLIENT_SIDE_ROLE_OVERRIDE_VERIFIED&#125;
              </pre>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Vulnerability: The isolated simulated application grants full admin view access without verifying the JWT signature on the server!
              </p>
            </div>
          ) : (
            /* Locked Student View */
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              border: '1px dashed var(--border-dim)'
            }}>
              <Lock size={32} color="#64748b" style={{ margin: '0 auto 0.75rem auto' }} />
              <h5 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '0.35rem' }}>
                Administrative Controls Locked
              </h5>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
                Your current simulated role is <strong>student</strong>. Examine the "Mock Headers & Storage" tab to inspect the client-side session dispatcher.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Mock Headers & Storage Inspector View */
        <div style={{
          padding: '1.25rem',
          background: '#070a16',
          borderRadius: '10px',
          border: '1px solid var(--border-dim)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>
            <h5 style={{ fontSize: '0.9rem', color: '#ffffff', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Simulated Client Request Headers
            </h5>
            <div style={{
              padding: '0.85rem',
              background: '#05070e',
              borderRadius: '6px',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.825rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Host:</span>
                <span style={{ color: '#ffffff' }}>synthetic-vault.bugarena.internal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#00f0ff' }}>X-Synthetic-Role:</span>
                <select
                  value={mockRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: '#0d1326' }}
                >
                  <option value="student">student (Default)</option>
                  <option value="auditor">auditor</option>
                  <option value="admin">admin (Exploit Bypass)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Authorization:</span>
                <span style={{ color: '#38bdf8' }}>Bearer {mockToken.slice(0, 25)}...</span>
              </div>
            </div>
          </div>

          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            background: 'rgba(0, 240, 255, 0.05)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            fontSize: '0.785rem',
            color: '#94a3b8'
          }}>
            Inspect how the simulated portal authenticates requests. Does it verify cryptographic claims or blindly honor the client-supplied <code style={{ color: '#00f0ff' }}>X-Synthetic-Role</code> header?
          </div>
        </div>
      )}
    </div>
  );
};
