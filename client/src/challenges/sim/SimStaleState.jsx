import React, { useState } from 'react';
import { ThumbsUp, RefreshCw, Zap, Clock } from 'lucide-react';

export const SimStaleState = ({ onLogEvent }) => {
  const [votes, setVotes] = useState({ topicA: 10, topicB: 12 });
  const [isPending, setIsPending] = useState(false);
  const [useFunctionalUpdater, setUseFunctionalUpdater] = useState(false);

  const castVote = (topic) => {
    setIsPending(true);
    const capturedVotes = votes; // Captures current closure state

    onLogEvent?.({
      type: 'VOTE_DISPATCHED',
      topic,
      capturedVotesAtClick: { ...capturedVotes },
      timestamp: Date.now()
    });

    // Simulated asynchronous network delay (600ms)
    setTimeout(() => {
      if (useFunctionalUpdater) {
        // CORRECT: Functional updater uses latest state
        setVotes((prev) => ({
          ...prev,
          [topic]: prev[topic] + 1
        }));
      } else {
        // INTENTIONAL REPRODUCIBLE BUG: Stale closure trap!
        // Overwrites state with stale capturedVotes + delta, wiping any vote cast during the 600ms window!
        setVotes({
          ...capturedVotes,
          [topic]: capturedVotes[topic] + 1
        });
      }

      setIsPending(false);
      onLogEvent?.({
        type: 'VOTE_SETTLED',
        topic,
        mode: useFunctionalUpdater ? 'FUNCTIONAL_UPDATER (Fixed)' : 'STALE_CLOSURE (Buggy)'
      });
    }, 600);
  };

  const handleReset = () => {
    setVotes({ topicA: 10, topicB: 12 });
    setIsPending(false);
    onLogEvent?.({ type: 'RESET_STATE', message: 'Restored poll counts to baseline 10 / 12.' });
  };

  const total = votes.topicA + votes.topicB;
  const pctA = Math.round((votes.topicA / total) * 100) || 50;
  const pctB = 100 - pctA;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Simulation Controls */}
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
          <Clock size={16} color="#00f0ff" />
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            Simulated Network Latency: <strong>600ms Delay per Vote</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useFunctionalUpdater}
              onChange={(e) => setUseFunctionalUpdater(e.target.checked)}
            />
            Use Functional Updater (Fix)
          </label>
          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} /> Reset Poll
          </button>
        </div>
      </div>

      {/* Voting Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {/* Topic A */}
        <div style={{
          padding: '1.25rem',
          background: '#0c1224',
          borderRadius: '10px',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-cyan">Keynote Topic A</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00f0ff', fontFamily: 'var(--font-heading)' }}>
              {votes.topicA} Votes
            </span>
          </div>
          <h4 style={{ color: '#ffffff', fontSize: '1.05rem' }}>AI Red Teaming & LLM Jailbreaks</h4>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Adversarial prompt fuzzing and automated weight extraction.</p>
          <button
            onClick={() => castVote('topicA')}
            className="btn btn-primary btn-sm"
            style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ThumbsUp size={14} /> Vote for Topic A
          </button>
        </div>

        {/* Topic B */}
        <div style={{
          padding: '1.25rem',
          background: '#0c1224',
          borderRadius: '10px',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-purple">Keynote Topic B</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-heading)' }}>
              {votes.topicB} Votes
            </span>
          </div>
          <h4 style={{ color: '#ffffff', fontSize: '1.05rem' }}>Post-Quantum Cryptanalysis</h4>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Lattice-based security vulnerabilities and quantum fault attacks.</p>
          <button
            onClick={() => castVote('topicB')}
            className="btn btn-purple btn-sm"
            style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ThumbsUp size={14} /> Vote for Topic B
          </button>
        </div>
      </div>

      {/* Progress Bar & Telemetry */}
      <div style={{ padding: '1rem', background: '#080d1c', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
          <span>Topic A: {pctA}% ({votes.topicA})</span>
          <span>Topic B: {pctB}% ({votes.topicB})</span>
        </div>
        <div style={{ height: '10px', borderRadius: '5px', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', overflow: 'hidden' }}>
          <div style={{ width: `${pctA}%`, background: '#00f0ff', transition: 'width 0.3s' }} />
          <div style={{ width: `${pctB}%`, background: '#8b5cf6', transition: 'width 0.3s' }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem', textAlign: 'center' }}>
          💡 <strong>Reproduction Trick:</strong> Click "Vote for Topic A" then immediately click "Vote for Topic B" within 300ms. Observe the second vote vanish when the first request resolves!
        </p>
      </div>
    </div>
  );
};
