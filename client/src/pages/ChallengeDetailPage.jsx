import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { challengesApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { DifficultyBadge, StatusBadge } from '../components/Badge.jsx';
import { AssistantModal } from '../components/AssistantModal.jsx';
import {
  Flame,
  Terminal,
  Lock,
  Unlock,
  Bot,
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert
} from 'lucide-react';

export const ChallengeDetailPage = () => {
  const { challengeId } = useParams();
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlockingTier, setUnlockingTier] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const fetchChallenge = () => {
    challengesApi.getById(challengeId)
      .then((res) => {
        if (res.challenge) setChallenge(res.challenge);
      })
      .catch((err) => toastError(err.message || 'Challenge not found.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChallenge();
  }, [challengeId]);

  const handleUnlockHint = async (tier) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setUnlockingTier(tier);
    try {
      const res = await challengesApi.unlockHint(challengeId, tier);
      success(res.message);
      // Refresh challenge hints
      fetchChallenge();
    } catch (err) {
      toastError(err.message || 'Could not unlock hint.');
    } finally {
      setUnlockingTier(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading challenge data...
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '1rem' }}>Challenge Not Found</h2>
        <Link to="/challenges" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back button */}
      <div>
        <Link to="/challenges" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          <ArrowLeft size={15} /> Back to Challenge Catalog
        </Link>
      </div>

      {/* Main Header Banner */}
      <div style={{
        padding: '2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <DifficultyBadge difficulty={challenge.difficulty} />
            <span className="badge badge-purple">{challenge.category}</span>
            <StatusBadge status={challenge.status} />
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#ffffff', marginBottom: '0.5rem' }}>
            {challenge.title}
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '720px' }}>
            {challenge.summary}
          </p>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '220px' }}>
          <Link
            to={`/glitch-lab?challenge=${challenge.challengeId}`}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Terminal size={16} /> Launch Simulation
          </Link>

          <Link
            to={`/submit-report?challenge=${challenge.challengeId}`}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <FileText size={16} /> Submit Bug Report
          </Link>

          <button
            onClick={() => setAssistantOpen(true)}
            className="btn btn-outline-cyan btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Bot size={15} /> Consult GlitchAssist
          </button>
        </div>
      </div>

      {/* Content Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Description & Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.75rem' }}>
              Challenge Scenario
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {challenge.description}
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.75rem' }}>
              Simulation Instructions
            </h3>
            <div style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
              fontFamily: 'var(--font-mono)',
              background: '#090d1c',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-dim)'
            }}>
              {challenge.instructions}
            </div>
          </div>
        </div>

        {/* Right Column: Progressive Hints System */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lightbulb size={18} color="#00f0ff" /> Progressive Diagnostic Hints
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Tiered Discovery
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Hints provide graduated clues without completely revealing the solution. Unlock Tier 1 first before advancing to subsequent tiers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(challenge.hints || []).map((hint) => (
                <div
                  key={hint.tier}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: hint.isUnlocked ? 'rgba(0, 240, 255, 0.05)' : '#080c1a',
                    border: '1px solid ' + (hint.isUnlocked ? 'rgba(0, 240, 255, 0.3)' : 'var(--border-dim)')
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className={`badge ${hint.isUnlocked ? 'badge-cyan' : 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>
                        Tier {hint.tier}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>{hint.title}</strong>
                    </div>

                    {hint.isUnlocked ? (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Unlock size={13} /> Unlocked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUnlockHint(hint.tier)}
                        disabled={unlockingTier === hint.tier}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        <Lock size={12} /> {unlockingTier === hint.tier ? 'Unlocking...' : 'Unlock'}
                      </button>
                    )}
                  </div>

                  {hint.isUnlocked ? (
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, marginTop: '0.5rem' }}>
                      {hint.text}
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.3rem' }}>
                      Locked clue. Click "Unlock" to reveal guidance for this tier.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Assistant Modal */}
      <AssistantModal
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        challengeId={challenge.challengeId}
        challengeTitle={challenge.title}
      />
    </div>
  );
};
