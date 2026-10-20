import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, FileCode, CheckCircle2, AlertOctagon } from 'lucide-react';

export const SimDataMismatch = ({ onLogEvent }) => {
  const [vector, setVector] = useState({
    attackVector: 'Network',
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'High'
  });

  const [useCorrectKeyMapping, setUseCorrectKeyMapping] = useState(false);

  // Simulated engine computes correct CVSS payload
  const isCritical = vector.attackVector === 'Network' && vector.privilegesRequired === 'None' && vector.confidentiality === 'High';
  const computedCvssScore = isCritical ? 9.8 : 6.5;
  const computedSeverity = isCritical ? 'Critical' : 'Medium';

  // The engine produces this JSON data structure:
  const vulnerabilityModel = {
    cveId: 'SYNTH-2026-9042',
    title: 'Remote Arbitrary State Corruption in Telemetry Service',
    cvssScore: computedCvssScore, // The real key is "cvssScore"
    severityTier: computedSeverity,
    vectorString: `CVSS:3.1/AV:${vector.attackVector[0]}/AC:${vector.attackComplexity[0]}/PR:${vector.privilegesRequired[0]}/UI:N/S:U/C:H/I:H/A:H`
  };

  // INTENTIONAL REPRODUCIBLE BUG:
  // Card looks for `vulnerabilityModel.score` instead of `vulnerabilityModel.cvssScore`.
  // Since `score` is undefined, it defaults to fallback metric 5.3!
  const renderedScore = useCorrectKeyMapping
    ? vulnerabilityModel.cvssScore
    : (vulnerabilityModel.score || 5.3);

  const renderedSeverity = useCorrectKeyMapping
    ? vulnerabilityModel.severityTier
    : (vulnerabilityModel.severity || 'Medium');

  const isMismatched = renderedScore !== vulnerabilityModel.cvssScore;

  const handleVectorChange = (key, val) => {
    setVector((prev) => ({ ...prev, [key]: val }));
    onLogEvent?.({
      type: 'METRIC_VECTOR_CHANGED',
      metric: key,
      value: val
    });
  };

  const handleReset = () => {
    setVector({
      attackVector: 'Network',
      attackComplexity: 'Low',
      privilegesRequired: 'None',
      confidentiality: 'High',
      integrity: 'High',
      availability: 'High'
    });
    onLogEvent?.({ type: 'RESET_STATE', message: 'Restored default CVSS vectors.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Control bar */}
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
          <FileCode size={16} color="#00f0ff" />
          Object Key Mapping: <strong style={{ color: useCorrectKeyMapping ? '#10b981' : '#f43f5e' }}>
            {useCorrectKeyMapping ? 'Correct (vulnerabilityModel.cvssScore)' : 'Buggy Typo (vulnerabilityModel.score || 5.3)'}
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useCorrectKeyMapping}
              onChange={(e) => setUseCorrectKeyMapping(e.target.checked)}
            />
            Inspect with Correct Key Mapping
          </label>
          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} /> Reset Vectors
          </button>
        </div>
      </div>

      {/* Two-Column Comparison View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Left: UI Display Card */}
        <div style={{
          padding: '1.25rem',
          background: '#0c1224',
          borderRadius: '10px',
          border: '1px solid ' + (isMismatched ? '#f43f5e' : 'rgba(0, 240, 255, 0.3)'),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-cyan">{vulnerabilityModel.cveId}</span>
              <span className={`badge ${renderedSeverity === 'Critical' ? 'badge-hard' : 'badge-medium'}`}>
                {renderedSeverity}
              </span>
            </div>

            <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              {vulnerabilityModel.title}
            </h4>

            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Vector: <code style={{ color: '#00f0ff' }}>{vulnerabilityModel.vectorString}</code>
            </p>

            {/* Display Score Gauge */}
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              background: '#070a14',
              border: '1px solid var(--border-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Rendered Score Badge:</span>
              <span style={{
                fontSize: '2rem',
                fontWeight: 900,
                fontFamily: 'var(--font-heading)',
                color: renderedScore >= 9.0 ? '#f43f5e' : '#f59e0b'
              }}>
                {renderedScore.toFixed(1)}
              </span>
            </div>
          </div>

          {isMismatched && (
            <div style={{
              marginTop: '1rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f43f5e',
              fontSize: '0.785rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <AlertOctagon size={15} style={{ flexShrink: 0 }} />
              UI renders 5.3 Medium instead of the 9.8 Critical metric calculated by the engine!
            </div>
          )}
        </div>

        {/* Right: Underlying Raw Synthetic JSON Telemetry */}
        <div style={{
          padding: '1.25rem',
          background: '#070a14',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontFamily: 'var(--font-mono)'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00f0ff', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Synthetic Engine JSON Output
          </div>
          <pre style={{
            fontSize: '0.8rem',
            color: '#38bdf8',
            background: '#05070f',
            padding: '1rem',
            borderRadius: '6px',
            overflowX: 'auto',
            border: '1px solid rgba(0, 240, 255, 0.15)'
          }}>
            {JSON.stringify(vulnerabilityModel, null, 2)}
          </pre>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.75rem' }}>
            Notice the property name in the JSON output: <code style={{ color: '#00f0ff' }}>"cvssScore": {computedCvssScore}</code> vs UI lookup <code style={{ color: '#f43f5e' }}>vuln.score</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
