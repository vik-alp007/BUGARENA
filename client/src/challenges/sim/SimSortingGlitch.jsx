import React, { useState } from 'react';
import { ArrowUpDown, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const INITIAL_SERVERS = [
  { id: 'srv-01', name: 'US-East Production', latency: 9, status: 'Online', load: '42%' },
  { id: 'srv-02', name: 'EU-Central Gateway', latency: 25, status: 'Online', load: '68%' },
  { id: 'srv-03', name: 'AP-South Database', latency: 120, status: 'Online', load: '85%' },
  { id: 'srv-04', name: 'US-West CDN Edge', latency: 45, status: 'Online', load: '31%' },
  { id: 'srv-05', name: 'SA-East Backup', latency: 3, status: 'Online', load: '12%' },
  { id: 'srv-06', name: 'AF-South Relay', latency: 300, status: 'Degraded', load: '94%' }
];

export const SimSortingGlitch = ({ onLogEvent }) => {
  const [servers, setServers] = useState([...INITIAL_SERVERS]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [useFixedSort, setUseFixedSort] = useState(false);

  const handleSort = () => {
    const nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(nextDir);

    const sorted = [...servers].sort((a, b) => {
      if (useFixedSort) {
        // Correct numerical comparator
        return nextDir === 'asc' ? a.latency - b.latency : b.latency - a.latency;
      } else {
        // INTENTIONAL REPRODUCIBLE BUG: Lexicographical string sorting!
        // "120" sorts before "25" and "3" because "1" < "2" < "3"
        const strA = a.latency.toString();
        const strB = b.latency.toString();
        return nextDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }
    });

    setServers(sorted);
    onLogEvent?.({
      type: 'SORT_TRIGGERED',
      column: 'latency',
      mode: useFixedSort ? 'NUMERIC (Fixed)' : 'DEFAULT_STRING (Buggy)',
      order: sorted.map((s) => `${s.latency}ms`).join(' → ')
    });
  };

  const handleReset = () => {
    setServers([...INITIAL_SERVERS]);
    setSortDirection('asc');
    onLogEvent?.({ type: 'RESET_STATE', message: 'Restored initial unordered node topology.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Simulation Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Simulated Component: <strong>Server Latency Matrix</strong>
          </span>
          <button
            onClick={handleSort}
            className="btn btn-outline-cyan btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowUpDown size={14} />
            Sort Latency ({sortDirection.toUpperCase()})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useFixedSort}
              onChange={(e) => {
                setUseFixedSort(e.target.checked);
                onLogEvent?.({
                  type: 'MODE_TOGGLE',
                  message: e.target.checked ? 'Applied custom comparator callback: (a,b) => a.latency - b.latency' : 'Reverted to default Array.sort() comparator.'
                });
              }}
            />
            Inspect with Fixed Comparator
          </label>

          <button onClick={handleReset} className="btn btn-secondary btn-sm" title="Reset Simulation">
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Latency Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border-dim)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#0a0f1d', borderBottom: '1px solid var(--border-dim)' }}>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600 }}>Node ID</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600 }}>Location & Name</th>
              <th
                onClick={handleSort}
                style={{
                  padding: '0.75rem 1rem',
                  color: '#00f0ff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                Latency (ms)
                <ArrowUpDown size={13} />
              </th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600 }}>System Load</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {servers.map((srv, idx) => (
              <tr
                key={srv.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent'
                }}
              >
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>{srv.id}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#ffffff', fontWeight: 500 }}>{srv.name}</td>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#00f0ff' }}>
                  {srv.latency} ms
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>{srv.load}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: srv.status === 'Online' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: srv.status === 'Online' ? '#10b981' : '#f43f5e'
                  }}>
                    {srv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Observation Box */}
      <div style={{
        padding: '0.85rem 1rem',
        borderRadius: '8px',
        background: 'rgba(0, 240, 255, 0.04)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        fontSize: '0.825rem',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
        <AlertCircle size={16} color="#00f0ff" style={{ flexShrink: 0 }} />
        <span>
          <strong>Glitch Testing Cue:</strong> Notice how <strong>120ms</strong> is ordered in relation to <strong>25ms</strong> and <strong>9ms</strong> when sorting ascending without the fix.
        </span>
      </div>
    </div>
  );
};
