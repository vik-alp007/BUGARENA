import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { challengesApi, reportsApi } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  FileText,
  Send,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  ArrowLeft,
  Terminal
} from 'lucide-react';

export const SubmitReportPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState(
    searchParams.get('challenge') || 'sorting-glitch'
  );

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('UI & Data Sorting');
  const [severity, setSeverity] = useState('medium');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [evidenceText, setEvidenceText] = useState(location.state?.evidenceText || '');

  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    challengesApi.getAll().then((res) => {
      if (res.challenges) {
        setChallenges(res.challenges);
        const initial = res.challenges.find((c) => c.challengeId === selectedChallengeId);
        if (initial) {
          setCategory(initial.category);
        }
      }
    });
  }, [selectedChallengeId]);

  const handleChallengeChange = (id) => {
    setSelectedChallengeId(id);
    const chal = challenges.find((c) => c.challengeId === id);
    if (chal) {
      setCategory(chal.category);
    }
  };

  const validate = () => {
    const errs = [];
    if (!title.trim() || title.trim().length < 5) {
      errs.push('Title must be at least 5 characters long.');
    }
    if (!reproductionSteps.trim() || reproductionSteps.trim().length < 20) {
      errs.push('Reproduction steps must be detailed (at least 20 characters).');
    }
    if (!expectedResult.trim() || expectedResult.trim().length < 10) {
      errs.push('Expected result must be at least 10 characters.');
    }
    if (!actualResult.trim() || actualResult.trim().length < 10) {
      errs.push('Actual result must be at least 10 characters.');
    }
    setFormErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        challengeId: selectedChallengeId,
        title: title.trim(),
        category: category.trim(),
        severity,
        reproductionSteps: reproductionSteps.trim(),
        expectedResult: expectedResult.trim(),
        actualResult: actualResult.trim(),
        evidenceText: evidenceText.trim()
      };

      const res = await reportsApi.submit(payload);
      success(res.message);
      navigate('/my-reports');
    } catch (err) {
      toastError(err.message || 'Report submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '840px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/glitch-lab" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={15} /> Return to Glitch Lab
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-cyan">REPORT SUBMISSION</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', color: '#ffffff' }}>
          Submit Bug <span className="gradient-text">Verification Proof</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Provide clear, reproducible steps for the tournament judges. Points are credited upon verification.
        </p>
      </div>

      {formErrors.length > 0 && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid #f43f5e',
          color: '#f43f5e',
          marginBottom: '1.5rem',
          fontSize: '0.85rem'
        }}>
          <strong>Submission Incomplete:</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
            {formErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Report Submission Form */}
      <form onSubmit={handleSubmit} style={{
        padding: '2rem',
        background: '#0c1122',
        borderRadius: '16px',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Challenge Selection Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Target Challenge *</label>
            <select
              value={selectedChallengeId}
              onChange={(e) => handleChallengeChange(e.target.value)}
              className="form-select"
            >
              {challenges.map((c) => (
                <option key={c.challengeId} value={c.challengeId}>
                  #{c.order.toString().padStart(2, '0')} {c.title} ({c.difficulty.toUpperCase()} • {c.points} pts)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Severity Level *</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="form-select"
            >
              <option value="low">Low (Cosmetic / Minor Drift)</option>
              <option value="medium">Medium (State Glitch / Incorrect Calc)</option>
              <option value="high">High (Race Condition / Data Loss)</option>
              <option value="critical">Critical (Privilege Flaw / Total Lock)</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label className="form-label">Report Title *</label>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{title.length}/120</span>
          </div>
          <input
            type="text"
            placeholder="e.g., Lexicographical string comparator flaw on latency column"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            maxLength={120}
            required
          />
        </div>

        {/* Category */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Vulnerability Category *</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
            placeholder="e.g. State Management, UI & Sorting, Async Race Condition"
            required
          />
        </div>

        {/* Reproduction Steps */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label className="form-label">Step-by-Step Reproduction Steps * (Min 20 chars)</label>
            <span style={{ fontSize: '0.75rem', color: reproductionSteps.length >= 20 ? '#10b981' : '#f43f5e' }}>
              {reproductionSteps.length} characters
            </span>
          </div>
          <textarea
            rows={5}
            placeholder={"1. Launch the challenge in Glitch Lab.\n2. Click the 'Latency (ms)' column header once.\n3. Observe node 120ms placed ahead of node 25ms.\n4. Notice the string-based comparator logic."}
            value={reproductionSteps}
            onChange={(e) => setReproductionSteps(e.target.value)}
            className="form-textarea"
            required
          />
        </div>

        {/* Expected vs Actual Result */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Expected Behavior *</label>
            <textarea
              rows={3}
              placeholder="e.g. Ascending numerical order should sort 9ms, then 25ms, then 120ms."
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Actual Observed Behavior *</label>
            <textarea
              rows={3}
              placeholder="e.g. Table orders lexicographically because values are compared as UTF-16 character strings."
              value={actualResult}
              onChange={(e) => setActualResult(e.target.value)}
              className="form-textarea"
              required
            />
          </div>
        </div>

        {/* Evidence / Telemetry Logs */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Evidence / Telemetry Logs (Optional)</label>
          <textarea
            rows={3}
            placeholder="Paste logs from the Glitch Lab telemetry console or code analysis here..."
            value={evidenceText}
            onChange={(e) => setEvidenceText(e.target.value)}
            className="form-textarea font-mono"
            style={{ fontSize: '0.8rem', color: '#38bdf8' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Eye size={15} /> Preview Report
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Send size={16} />
            {submitting ? 'Submitting to Queue...' : 'Submit Bug Report'}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="modal-backdrop" onClick={() => setPreviewOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '1rem' }}>
              Report Preview
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span className="badge badge-cyan">{selectedChallengeId}</span>
                <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginTop: '0.4rem' }}>{title || '(No title entered)'}</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Category: {category} • Severity: {severity.toUpperCase()}</p>
              </div>

              <div style={{ background: '#090e20', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ color: '#00f0ff', fontSize: '0.8rem', textTransform: 'uppercase' }}>Reproduction Steps:</strong>
                <p style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', marginTop: '0.35rem', fontSize: '0.85rem' }}>
                  {reproductionSteps || '(Empty)'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: '#090e20', padding: '0.85rem', borderRadius: '8px' }}>
                  <strong style={{ color: '#10b981', fontSize: '0.75rem', textTransform: 'uppercase' }}>Expected Result:</strong>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '0.25rem' }}>{expectedResult || '(Empty)'}</p>
                </div>
                <div style={{ background: '#090e20', padding: '0.85rem', borderRadius: '8px' }}>
                  <strong style={{ color: '#f43f5e', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actual Result:</strong>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '0.25rem' }}>{actualResult || '(Empty)'}</p>
                </div>
              </div>

              {evidenceText && (
                <div style={{ background: '#060914', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
                  <strong style={{ color: '#a855f7', fontSize: '0.75rem', textTransform: 'uppercase' }}>Evidence Telemetry:</strong>
                  <pre style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.35rem', overflowX: 'auto' }}>
                    {evidenceText}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setPreviewOpen(false)} className="btn btn-secondary">
                Close Preview
              </button>
              <button onClick={() => { setPreviewOpen(false); handleSubmit(); }} className="btn btn-primary">
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
