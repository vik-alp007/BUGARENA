import React, { useState } from 'react';
import { Server, Zap, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const SimDoubleTrigger = ({ onLogEvent }) => {
  const [instances, setInstances] = useState([]);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [useDebounceLock, setUseDebounceLock] = useState(false);

  // Synchronous ref lock for fixed mode
  const inFlightRef = React.useRef(false);

  const handleProvision = () => {
    // If fixed with sync ref mutex
    if (useDebounceLock && inFlightRef.current) {
      onLogEvent?.({ type: 'MUTEX_BLOCKED', message: 'Double click blocked by synchronous in-flight guard!' });
      return;
    }

    if (useDebounceLock) {
      inFlightRef.current = true;
    }

    // INTENTIONAL REPRODUCIBLE BUG:
    // In buggy mode, `isProvisioning` state is updated asynchronously via React re-render.
    // If the user clicks twice quickly before re-render, both callbacks fire!
    setIsProvisioning(true);

    const instanceId = `node-${Math.random().toString(36).substring(2, 7)}`;
    onLogEvent?.({
      type: 'PROVISION_REQUEST_INITIATED',
      instanceId,
      time: new Date().toLocaleTimeString()
    });

    // Simulated cloud provisioning latency (500ms)
    setTimeout(() => {
      const newInst = {
        id: instanceId,
        ip: `192.168.10.${Math.floor(Math.random() * 200) + 10}`,
        region: 'us-east-zone1',
        status: 'Running',
        createdAt: new Date().toLocaleTimeString()
      };

      setInstances((prev) => [...prev, newInst]);
      setIsProvisioning(false);
      inFlightRef.current = false;

      onLogEvent?.({
        type: 'INSTANCE_PROVISIONED',
        instance: newInst
      });
    }, 500);
  };

  const handleReset = () => {
    setInstances([]);
    setIsProvisioning(false);
    inFlightRef.current = false;
    onLogEvent?.({ type: 'RESET_STATE', message: 'Torn down all active sandbox instances.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Control Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={16} color="#00f0ff" />
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            Active Sandbox Instances: <strong>{instances.length}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useDebounceLock}
              onChange={(e) => setUseDebounceLock(e.target.checked)}
            />
            Inspect with Synchronous Mutex Lock
          </label>
          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} /> Terminate All
          </button>
        </div>
      </div>

      {/* Action Trigger Card */}
      <div style={{
        padding: '1.5rem',
        background: '#0c1224',
        borderRadius: '10px',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
            Isolated Kali Linux PenTest Container
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Spins up dedicated temporary container with root telemetry. Billed at simulated $15.00/hr.
          </p>
        </div>

        <button
          onClick={handleProvision}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Zap size={16} />
          {isProvisioning ? 'Allocating Resources...' : 'Provision Sandbox Container'}
        </button>
      </div>

      {/* Instances Table */}
      <div style={{
        border: '1px solid var(--border-dim)',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#070a14'
      }}>
        <div style={{ padding: '0.75rem 1rem', background: '#0e1326', borderBottom: '1px solid var(--border-dim)', fontWeight: 600, fontSize: '0.85rem', color: '#cbd5e1' }}>
          Running Cloud Nodes
        </div>
        {instances.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {instances.map((inst, i) => (
              <div
                key={inst.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-cyan font-mono">{inst.id}</span>
                  <span style={{ color: '#ffffff' }}>IP: {inst.ip}</span>
                  <span style={{ color: '#64748b' }}>({inst.region})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Spawned at {inst.createdAt}</span>
                  <span className="badge badge-easy">{inst.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
            No active nodes. Rapidly double click the "Provision Sandbox Container" button above to observe duplicate provisioning!
          </div>
        )}
      </div>

      {instances.length > 1 && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#f43f5e',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertTriangle size={15} />
          Multiple twin instances detected! Rapid click bypassed button debouncing.
        </div>
      )}
    </div>
  );
};
