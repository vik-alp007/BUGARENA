import React, { useState, useRef } from 'react';
import { Search, ShieldAlert, RefreshCw, Clock, ArrowRight } from 'lucide-react';

const MOCK_INTEL_DB = {
  ransomware: [
    { id: 'TH-01', title: 'LockBit 3.0 Encryptor Analysis', cve: 'CVE-2023-38606', severity: 'Critical' },
    { id: 'TH-02', title: 'BlackCat Double-Extortion TTPs', cve: 'CVE-2023-28252', severity: 'High' }
  ],
  botnet: [
    { id: 'TH-03', title: 'Mirai Variant IoT Exploitation', cve: 'CVE-2024-21887', severity: 'High' },
    { id: 'TH-04', title: 'Andromeda C2 Infrastructure Takedown', cve: 'CVE-2022-41082', severity: 'Medium' }
  ],
  phishing: [
    { id: 'TH-05', title: 'AiTM Evilginx Reverse Proxy Framework', cve: 'CWE-290', severity: 'High' }
  ]
};

export const SimRaceCondition = ({ onLogEvent }) => {
  const [query, setQuery] = useState('');
  const [displayedResults, setDisplayedResults] = useState([]);
  const [lastResolvedTerm, setLastResolvedTerm] = useState('');
  const [useAbortGuard, setUseAbortGuard] = useState(false);
  const [inFlightQueries, setInFlightQueries] = useState([]);

  // Counter to simulate AbortController / sequence tagging in fixed mode
  const latestReqIdRef = useRef(0);

  const performSearch = (searchTerm) => {
    setQuery(searchTerm);
    if (!searchTerm.trim()) {
      setDisplayedResults([]);
      return;
    }

    const currentReqId = ++latestReqIdRef.current;
    const cleanTerm = searchTerm.toLowerCase().trim();

    // INTENTIONAL REPRODUCIBLE RACE CONDITION:
    // Searching "ransomware" simulates high latency (1200ms)
    // Searching "botnet" simulates fast response (300ms)
    const latency = cleanTerm.includes('ransom') ? 1200 : 350;

    setInFlightQueries((prev) => [
      ...prev,
      { id: currentReqId, term: searchTerm, latency, startedAt: Date.now() }
    ]);

    onLogEvent?.({
      type: 'ASYNC_REQUEST_DISPATCHED',
      query: searchTerm,
      simulatedLatency: `${latency}ms`,
      requestId: currentReqId
    });

    setTimeout(() => {
      // In Fixed Mode: discard response if a newer query has been dispatched
      if (useAbortGuard && currentReqId !== latestReqIdRef.current) {
        onLogEvent?.({
          type: 'STALE_RESPONSE_ABORTED',
          requestId: currentReqId,
          query: searchTerm,
          message: `Discarded outdated response for "${searchTerm}" because active req is #${latestReqIdRef.current}`
        });
        setInFlightQueries((prev) => prev.filter((q) => q.id !== currentReqId));
        return;
      }

      // INTENTIONAL BUG: Unconditional state update without timestamp or cancellation guard!
      const matched = Object.keys(MOCK_INTEL_DB)
        .filter((k) => k.includes(cleanTerm) || cleanTerm.includes(k))
        .flatMap((k) => MOCK_INTEL_DB[k]);

      setDisplayedResults(matched.length > 0 ? matched : [{ id: 'TH-00', title: `No threats found for "${searchTerm}"`, severity: 'Low' }]);
      setLastResolvedTerm(searchTerm);
      setInFlightQueries((prev) => prev.filter((q) => q.id !== currentReqId));

      onLogEvent?.({
        type: 'ASYNC_RESPONSE_RENDERED',
        renderedQuery: searchTerm,
        resultsCount: matched.length,
        isDesyncedFromInput: searchTerm.toLowerCase() !== query.toLowerCase()
      });
    }, latency);
  };

  const handleReset = () => {
    setQuery('');
    setDisplayedResults([]);
    setLastResolvedTerm('');
    setInFlightQueries([]);
    onLogEvent?.({ type: 'RESET_STATE', message: 'Threat Intelligence Search reset.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search Header */}
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
          <Clock size={16} color="#00f0ff" />
          Latency Profiler: <strong style={{ color: '#f43f5e' }}>"Ransomware" = 1200ms</strong> vs <strong style={{ color: '#10b981' }}>"Botnet" = 350ms</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useAbortGuard}
              onChange={(e) => setUseAbortGuard(e.target.checked)}
            />
            Inspect with AbortController Guard
          </label>
          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Interactive Search Bar */}
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#00f0ff' }} />
        <input
          type="text"
          placeholder="Type 'Ransomware' then immediately type 'Botnet'..."
          value={query}
          onChange={(e) => performSearch(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '2.8rem', fontSize: '1rem' }}
        />
      </div>

      {/* Fast preset buttons for easy reproduction */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
        <span>Quick Test Sequence:</span>
        <button
          onClick={() => {
            performSearch('Ransomware');
            setTimeout(() => performSearch('Botnet'), 150);
          }}
          className="btn btn-outline-cyan btn-sm"
          style={{ fontSize: '0.75rem' }}
        >
          ⚡ Auto-Fire Test Sequence ('Ransomware' → 'Botnet')
        </button>
      </div>

      {/* In-Flight Queries Monitor */}
      {inFlightQueries.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {inFlightQueries.map((q) => (
            <span key={q.id} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
              Pending: "{q.term}" ({q.latency}ms latency)
            </span>
          ))}
        </div>
      )}

      {/* Results View */}
      <div style={{
        padding: '1.25rem',
        background: '#090e20',
        borderRadius: '10px',
        border: '1px solid ' + (query && lastResolvedTerm && query.toLowerCase() !== lastResolvedTerm.toLowerCase() ? '#f43f5e' : 'var(--border-dim)')
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#ffffff' }}>
            Threat Intelligence Findings
          </h4>
          {lastResolvedTerm && (
            <span style={{
              fontSize: '0.8rem',
              color: query.toLowerCase() !== lastResolvedTerm.toLowerCase() ? '#f43f5e' : '#10b981',
              fontFamily: 'var(--font-mono)'
            }}>
              Results rendered for: "{lastResolvedTerm}" {query.toLowerCase() !== lastResolvedTerm.toLowerCase() && '⚠️ DESYNC DETECTED'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {displayedResults.map((res) => (
            <div
              key={res.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: '#0d1326',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <div>
                <p style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>{res.title}</p>
                {res.cve && <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Vector: {res.cve}</p>}
              </div>
              <span className={`badge ${res.severity === 'Critical' ? 'badge-hard' : res.severity === 'High' ? 'badge-medium' : 'badge-easy'}`}>
                {res.severity}
              </span>
            </div>
          ))}

          {displayedResults.length === 0 && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              Type into the search input above to observe out-of-order asynchronous responses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
