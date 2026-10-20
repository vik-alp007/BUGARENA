import React, { useState } from 'react';
import { Search, RotateCcw, Filter, Star, Check } from 'lucide-react';

const SESSIONS = [
  { id: 1, title: 'Kernel Exploitation 101', track: 'binary', rating: 4.8, speaker: 'Dr. Sarah Lin' },
  { id: 2, title: 'Bypassing WAFs with Unicode Homoglyphs', track: 'web', rating: 4.6, speaker: 'Kiran Patel' },
  { id: 3, title: 'Hardware Bus Sniffing with Logic Analyzers', track: 'hardware', rating: 4.9, speaker: 'Mark Thorne' },
  { id: 4, title: 'Post-Quantum Lattice Cryptography', track: 'crypto', rating: 4.2, speaker: 'Elena Rostova' },
  { id: 5, title: 'GraphQL Injection & Schema Leaks', track: 'web', rating: 4.5, speaker: 'Zara Ahmed' },
  { id: 6, title: 'Automating Firmware Extraction via SPI', track: 'hardware', rating: 4.7, speaker: 'Mark Thorne' }
];

export const SimBrokenReset = ({ onLogEvent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [minRating, setMinRating] = useState(0);

  // INTENTIONAL REPRODUCIBLE BUG: Reset button only resets searchTerm, leaving selectedTrack and minRating behind!
  const handleReset = () => {
    setSearchTerm('');
    // Notice: setSelectedTrack('all') and setMinRating(0) are missing!

    onLogEvent?.({
      type: 'PARTIAL_RESET_EXECUTED',
      message: `Reset executed! Query input cleared, but track remains "${selectedTrack}" and minRating remains ${minRating}.`
    });
  };

  const handleFullReset = () => {
    setSearchTerm('');
    setSelectedTrack('all');
    setMinRating(0);
    onLogEvent?.({ type: 'FULL_RESET_EXECUTED', message: 'All filters re-initialized to default state.' });
  };

  // Filter evaluation
  const filteredSessions = SESSIONS.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = selectedTrack === 'all' || s.track === selectedTrack;
    const matchesRating = s.rating >= minRating;
    return matchesSearch && matchesTrack && matchesRating;
  });

  const activeFilterCount = (searchTerm ? 1 : 0) + (selectedTrack !== 'all' ? 1 : 0) + (minRating > 0 ? 1 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Filter Control Bar */}
      <div style={{
        padding: '1.25rem',
        background: '#090e1e',
        borderRadius: '10px',
        border: '1px solid var(--border-dim)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search session title or speaker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Track Filter */}
          <select
            value={selectedTrack}
            onChange={(e) => {
              setSelectedTrack(e.target.value);
              onLogEvent?.({ type: 'TRACK_FILTER', track: e.target.value });
            }}
            className="form-select"
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="all">All Tracks</option>
            <option value="hardware">Hardware Hacking</option>
            <option value="web">Web Exploitation</option>
            <option value="binary">Binary Analysis</option>
            <option value="crypto">Cryptography</option>
          </select>

          {/* Min Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0b1022', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
            <Star size={15} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Min: {minRating}★</span>
            <input
              type="range"
              min="0"
              max="4.8"
              step="0.2"
              value={minRating}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setMinRating(val);
                onLogEvent?.({ type: 'RATING_SLIDER', value: val });
              }}
              style={{ width: '80px', cursor: 'pointer' }}
            />
          </div>

          {/* Buggy Reset Button */}
          <button
            onClick={handleReset}
            className="btn btn-outline-cyan btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RotateCcw size={14} />
            Reset All Filters
          </button>
        </div>

        {/* Filter telemetry pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.785rem', color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Active Filter Count:</span>
            <span className={`badge ${activeFilterCount > 0 ? 'badge-purple' : 'badge-gray'}`}>
              {activeFilterCount} active
            </span>
            {selectedTrack !== 'all' && (
              <span className="badge badge-cyan">Track: {selectedTrack}</span>
            )}
            {minRating > 0 && (
              <span className="badge badge-medium">Rating &ge; {minRating}</span>
            )}
          </div>

          <span style={{ fontFamily: 'var(--font-mono)' }}>
            Showing {filteredSessions.length} of {SESSIONS.length} sessions
          </span>
        </div>
      </div>

      {/* Session Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {filteredSessions.length > 0 ? (
          filteredSessions.map((s) => (
            <div
              key={s.id}
              style={{
                padding: '1rem',
                background: '#0d1326',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{s.track}</span>
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Star size={12} fill="#f59e0b" /> {s.rating}
                </span>
              </div>
              <h4 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.35rem' }}>{s.title}</h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Speaker: {s.speaker}</p>
            </div>
          ))
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            padding: '2rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            color: '#64748b'
          }}>
            No sessions match your currently active filters. Press "Reset All Filters" and check if filters restore!
          </div>
        )}
      </div>
    </div>
  );
};
