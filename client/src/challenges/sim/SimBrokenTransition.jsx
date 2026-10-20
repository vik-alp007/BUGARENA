import React, { useState } from 'react';
import { GitCommit, ArrowRight, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { num: 1, name: 'Draft Finding', desc: 'Summary & Vulnerability Scope' },
  { num: 2, name: 'Verification', desc: 'Exploit Reproduction Proof' },
  { num: 3, name: 'Vendor Triage', desc: 'Security Team Review' },
  { num: 4, name: 'Publication', desc: 'Advisory Release' }
];

export const SimBrokenTransition = ({ onLogEvent }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [triageStatus, setTriageStatus] = useState('unassigned');
  const [useFixedStateMachine, setUseFixedStateMachine] = useState(false);

  // Transition guards
  // BUGGY GUARD: If triageStatus is 'locked_in_review', Step 2 refuses both backward and forward transitions!
  const isDeadlocked = currentStep === 2 && triageStatus === 'locked_in_review' && !useFixedStateMachine;

  const handleNext = () => {
    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // When reaching Step 3, the triage state locks
      if (nextStep === 3) {
        setTriageStatus('locked_in_review');
      }

      onLogEvent?.({
        type: 'STEP_TRANSITION_FORWARD',
        from: currentStep,
        to: nextStep,
        triageStatus: nextStep === 3 ? 'locked_in_review' : triageStatus
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);

      if (useFixedStateMachine) {
        // CORRECT: Rollback resets downstream locked sub-state
        setTriageStatus('unassigned');
      }
      // INTENTIONAL REPRODUCIBLE BUG:
      // Does not clear triageStatus ('locked_in_review' remains active)!

      onLogEvent?.({
        type: 'STEP_TRANSITION_BACKWARD',
        from: currentStep,
        to: prevStep,
        triageStatus: useFixedStateMachine ? 'unassigned' : triageStatus,
        deadlockDetected: prevStep === 2 && triageStatus === 'locked_in_review' && !useFixedStateMachine
      });
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setTriageStatus('unassigned');
    onLogEvent?.({ type: 'RESET_STATE', message: 'Restored Disclosure Wizard to Step 1.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* State Machine Status Bar */}
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
          <GitCommit size={16} color="#00f0ff" />
          FSM Guard State: <span className={`badge ${isDeadlocked ? 'badge-hard' : 'badge-cyan'}`}>
            {isDeadlocked ? 'DEADLOCK / ILLEGAL STATE' : `Active Step ${currentStep} (${triageStatus})`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useFixedStateMachine}
              onChange={(e) => setUseFixedStateMachine(e.target.checked)}
            />
            Inspect with Validated FSM Rollback
          </label>
          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} /> Reset Wizard
          </button>
        </div>
      </div>

      {/* Step Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '0.75rem'
      }}>
        {STEPS.map((s) => {
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;

          return (
            <div
              key={s.num}
              style={{
                padding: '0.85rem',
                borderRadius: '8px',
                background: isCurrent ? 'rgba(0, 240, 255, 0.12)' : isDone ? 'rgba(16, 185, 129, 0.08)' : '#0a0e1c',
                border: '1px solid ' + (isCurrent ? '#00f0ff' : isDone ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.06)'),
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: isCurrent ? '#00f0ff' : isDone ? '#10b981' : '#64748b',
                fontFamily: 'var(--font-mono)'
              }}>
                STAGE 0{s.num}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginTop: '0.2rem' }}>
                {s.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Wizard Interactive Form */}
      <div style={{
        padding: '1.5rem',
        background: '#090e20',
        borderRadius: '10px',
        border: '1px solid ' + (isDeadlocked ? '#f43f5e' : 'var(--border-dim)')
      }}>
        <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>
          Step {currentStep}: {STEPS[currentStep - 1].name}
        </h4>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
          {STEPS[currentStep - 1].desc}
        </p>

        {isDeadlocked && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid #f43f5e',
            color: '#f43f5e',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Transition Guard Conflict:</strong> Step 2 is active, but sub-state <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.3rem' }}>triageStatus: 'locked_in_review'</code> was not cleared on backward transition. Navigation buttons are disabled!
            </div>
          </div>
        )}

        {/* Wizard Navigation Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isDeadlocked}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === 4 || isDeadlocked}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            Next Stage <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
