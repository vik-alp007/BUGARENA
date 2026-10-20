import React, { useState } from 'react';
import { UserPlus, Users, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

const INITIAL_ATTENDEES = [
  { id: 1, name: 'Alex Vance', role: 'Security Researcher', handle: '@avance' },
  { id: 2, name: 'Devon Chen', role: 'Binary Analyst', handle: '@dchen' }
];

export const SimPhantomCounter = ({ onLogEvent }) => {
  const [attendees, setAttendees] = useState([...INITIAL_ATTENDEES]);
  // INTENTIONAL REPRODUCIBLE BUG: Separate primitive state decoupled from derived attendees.length
  const [displayedCount, setDisplayedCount] = useState(INITIAL_ATTENDEES.length);

  const handleAddSingle = () => {
    const newId = Date.now();
    const newAttendee = {
      id: newId,
      name: `Guest Cadet #${attendees.length + 1}`,
      role: 'Participant',
      handle: `@cadet_${newId.toString().slice(-4)}`
    };

    setAttendees((prev) => [...prev, newAttendee]);
    setDisplayedCount((c) => c + 1);

    onLogEvent?.({
      type: 'ADD_SINGLE',
      message: `Added 1 attendee. True count: ${attendees.length + 1}, Displayed: ${displayedCount + 1}`
    });
  };

  const handleBatchAdd = () => {
    const newBatch = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      name: `VIP Squad Member #${attendees.length + i + 1}`,
      role: 'VIP Auditor',
      handle: `@vip_${(Date.now() + i).toString().slice(-4)}`
    }));

    setAttendees((prev) => [...prev, ...newBatch]);
    // BUG: Increments by 1 instead of 5!
    setDisplayedCount((c) => c + 1);

    onLogEvent?.({
      type: 'BATCH_ADD',
      message: `Batch added 5 attendees! True count: ${attendees.length + 5}, but UI counter incremented by only 1 (Displayed: ${displayedCount + 1})`
    });
  };

  const handleRemove = (id) => {
    setAttendees((prev) => prev.filter((a) => a.id !== id));
    // BUG: Decrements by 2 instead of 1!
    setDisplayedCount((c) => Math.max(0, c - 2));

    onLogEvent?.({
      type: 'REMOVE_ITEM',
      message: `Removed 1 attendee. Decremented UI counter by 2 (Displayed: ${Math.max(0, displayedCount - 2)}, True list: ${attendees.length - 1})`
    });
  };

  const handleReset = () => {
    setAttendees([...INITIAL_ATTENDEES]);
    setDisplayedCount(INITIAL_ATTENDEES.length);
    onLogEvent?.({ type: 'RESET_STATE', message: 'Restored initial attendee quota state.' });
  };

  const isDesynced = displayedCount !== attendees.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner with Phantom Counter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 1.5rem',
        background: '#0a0f20',
        borderRadius: '10px',
        border: '1px solid ' + (isDesynced ? 'rgba(244, 63, 94, 0.4)' : 'rgba(0, 240, 255, 0.2)'),
        boxShadow: isDesynced ? '0 0 20px rgba(244, 63, 94, 0.2)' : 'none'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Allocated Badge Passes
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.2rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: '#ffffff', lineHeight: 1 }}>
              {displayedCount}
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              / 50 Max Quota
            </span>
          </div>
        </div>

        {/* Real Array Length Telemetry for Inspector */}
        <div style={{
          padding: '0.6rem 1rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-dim)',
          textAlign: 'right'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            True Array Length: <strong style={{ color: '#00f0ff' }}>{attendees.length}</strong>
          </span>
          {isDesynced && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              <AlertTriangle size={12} /> Desync Drift: {Math.abs(displayedCount - attendees.length)}
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
        <button onClick={handleAddSingle} className="btn btn-outline-cyan btn-sm">
          <UserPlus size={14} /> Add Single Attendee (+1)
        </button>
        <button onClick={handleBatchAdd} className="btn btn-purple btn-sm">
          <Users size={14} /> Batch Add VIP Squad (+5)
        </button>
        <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
          <RefreshCw size={13} /> Reset Counter
        </button>
      </div>

      {/* Attendee List Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '0.75rem',
        maxHeight: '260px',
        overflowY: 'auto',
        padding: '0.5rem',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px'
      }}>
        {attendees.map((attendee) => (
          <div
            key={attendee.id}
            style={{
              padding: '0.75rem 1rem',
              background: '#0d1326',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}
          >
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>{attendee.name}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{attendee.role} • {attendee.handle}</p>
            </div>
            <button
              onClick={() => handleRemove(attendee.id)}
              className="btn btn-danger btn-sm"
              title="Remove attendee"
              style={{ padding: '0.3rem 0.5rem' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
