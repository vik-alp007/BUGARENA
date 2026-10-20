import React, { useState } from 'react';
import { BookOpen, AlertTriangle, RefreshCw, FileText, CheckSquare, Save } from 'lucide-react';

// Subcomponents that unmount when tab changes
const TabRecon = ({ onLogEvent }) => {
  // INTENTIONAL REPRODUCIBLE BUG: Ephemeral local state in unmounting child component!
  const [targetIp, setTargetIp] = useState('');
  const [openPorts, setOpenPorts] = useState('');
  const [checkedNmap, setCheckedNmap] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div>
        <label className="form-label">Target Subnet / Hostname</label>
        <input
          type="text"
          placeholder="e.g., 10.10.14.50"
          value={targetIp}
          onChange={(e) => {
            setTargetIp(e.target.value);
            onLogEvent?.({ type: 'INPUT_RECON_TARGET', value: e.target.value });
          }}
          className="form-input"
        />
      </div>
      <div>
        <label className="form-label">Identified Open Ports</label>
        <input
          type="text"
          placeholder="e.g., 22/tcp, 80/tcp, 8080/tcp"
          value={openPorts}
          onChange={(e) => {
            setOpenPorts(e.target.value);
            onLogEvent?.({ type: 'INPUT_RECON_PORTS', value: e.target.value });
          }}
          className="form-input"
        />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={checkedNmap}
          onChange={(e) => setCheckedNmap(e.target.checked)}
        />
        Completed full TCP SYN scan (-sS -T4 -p-)
      </label>
    </div>
  );
};

const TabVuln = ({ onLogEvent }) => {
  const [cveId, setCveId] = useState('');
  const [severity, setSeverity] = useState('High');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div>
        <label className="form-label">Vulnerability / Weakness Type</label>
        <input
          type="text"
          placeholder="e.g., CWE-287 Impersonation / Logic Bypass"
          value={cveId}
          onChange={(e) => {
            setCveId(e.target.value);
            onLogEvent?.({ type: 'INPUT_VULN_TYPE', value: e.target.value });
          }}
          className="form-input"
        />
      </div>
      <div>
        <label className="form-label">Assessed Severity Rating</label>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="form-select"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>
    </div>
  );
};

const TabPoc = ({ onLogEvent }) => {
  const [pocCode, setPocCode] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div>
        <label className="form-label">Proof-of-Concept Script / Payload</label>
        <textarea
          placeholder="curl -X POST http://sandbox.internal/api/override..."
          value={pocCode}
          onChange={(e) => {
            setPocCode(e.target.value);
            onLogEvent?.({ type: 'INPUT_POC', value: e.target.value });
          }}
          className="form-textarea"
          rows={4}
        />
      </div>
    </div>
  );
};

export const SimLostProgress = ({ onLogEvent }) => {
  const [activeTab, setActiveTab] = useState('recon');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    onLogEvent?.({
      type: 'TAB_SWITCH',
      newTab: tab,
      warning: 'Switched tab: Previous tab subcomponent was unmounted from DOM without persisting draft state!'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-dim)',
        gap: '0.5rem',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => handleTabChange('recon')}
          className={`btn btn-sm ${activeTab === 'recon' ? 'btn-primary' : 'btn-secondary'}`}
        >
          1. Reconnaissance
        </button>
        <button
          onClick={() => handleTabChange('vuln')}
          className={`btn btn-sm ${activeTab === 'vuln' ? 'btn-primary' : 'btn-secondary'}`}
        >
          2. Vulnerability
        </button>
        <button
          onClick={() => handleTabChange('poc')}
          className={`btn btn-sm ${activeTab === 'poc' ? 'btn-primary' : 'btn-secondary'}`}
        >
          3. Proof of Concept
        </button>
      </div>

      {/* Tab Content Area */}
      <div style={{
        padding: '1.5rem',
        background: '#0a0f22',
        borderRadius: '10px',
        border: '1px solid var(--border-dim)'
      }}>
        {activeTab === 'recon' && <TabRecon onLogEvent={onLogEvent} />}
        {activeTab === 'vuln' && <TabVuln onLogEvent={onLogEvent} />}
        {activeTab === 'poc' && <TabPoc onLogEvent={onLogEvent} />}
      </div>

      {/* Observation Box */}
      <div style={{
        padding: '0.85rem 1rem',
        borderRadius: '8px',
        background: 'rgba(244, 63, 94, 0.08)',
        border: '1px solid rgba(244, 63, 94, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.825rem',
        color: '#f43f5e'
      }}>
        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Glitch Testing Cue:</strong> Type IP details in Tab 1, switch to Tab 2, and then return to Tab 1. Watch what happens to your unsaved draft!
        </span>
      </div>
    </div>
  );
};
