import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { StatusBadge, DifficultyBadge } from '../components/Badge.jsx';
import {
  ShieldAlert,
  Sliders,
  Users,
  FileCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  MessageSquare,
  Clock,
  Zap,
  Activity,
  Eye
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { success, error: toastError } = useToast();

  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected report for review modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fetchAdminData = () => {
    Promise.all([
      adminApi.getStats(),
      adminApi.getReports()
    ])
      .then(([statsRes, reportsRes]) => {
        if (statsRes.stats) setStats(statsRes.stats);
        if (statsRes.recentAuditLogs) setRecentLogs(statsRes.recentAuditLogs);
        if (reportsRes.reports) setReports(reportsRes.reports);
      })
      .catch((err) => toastError(err.message || 'Failed to load admin data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    if ((reviewAction === 'rejected' || reviewAction === 'changes_requested') && (!reviewFeedback.trim() || reviewFeedback.trim().length < 5)) {
      toastError('Constructive feedback is required when rejecting or requesting changes.');
      return;
    }

    setReviewing(true);
    try {
      const res = await adminApi.reviewReport(selectedReport._id, {
        status: reviewAction,
        adminFeedback: reviewFeedback.trim()
      });

      success(res.message);
      setSelectedReport(null);
      setReviewFeedback('');
      fetchAdminData();
    } catch (err) {
      toastError(err.message || 'Failed to review report.');
    } finally {
      setReviewing(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.challenge?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-purple">SYSTEM EVALUATION CONSOLE</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#ffffff' }}>
            Admin <span className="gradient-text">Command Center</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Triage submitted vulnerability reports, grade reproduction proofs, and monitor tournament integrity.
          </p>
        </div>
      </div>

      {/* Admin Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <StatCard
          title="Total Competitors"
          value={stats?.totalUsers ?? 0}
          subtitle="Enlisted participants"
          icon={Users}
          accent="cyan"
        />
        <StatCard
          title="Pending Triage"
          value={stats?.pendingReports ?? 0}
          subtitle="Awaiting admin evaluation"
          icon={Clock}
          accent="amber"
        />
        <StatCard
          title="Approval Rate"
          value={`${stats?.approvalRate ?? 0}%`}
          subtitle={`${stats?.approvedReports ?? 0} verified submissions`}
          icon={CheckCircle}
          accent="green"
        />
        <StatCard
          title="Points Credited"
          value={`${stats?.totalPointsAwarded ?? 0} PTS`}
          subtitle="Total verified awards"
          icon={Zap}
          accent="purple"
        />
      </div>

      {/* Triage Queue Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Triage Controls Bar */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: '#0a0e20',
          borderBottom: '1px solid var(--border-dim)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Vulnerability Triage Queue</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Review submitted proofs and award points</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Status Pills */}
            {['all', 'pending', 'approved', 'changes_requested', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.785rem', textTransform: 'capitalize' }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border-dim)', background: '#070a16' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search by title, competitor, or challenge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Triage Reports Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-dim)', color: '#94a3b8', background: '#090d1c' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Challenge</th>
                <th style={{ padding: '0.85rem 1rem' }}>Report Title</th>
                <th style={{ padding: '0.85rem 1rem' }}>Hunter</th>
                <th style={{ padding: '0.85rem 1rem' }}>Severity</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Submitted At</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r) => (
                <tr
                  key={r._id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: r.status === 'pending' ? 'rgba(245, 158, 11, 0.02)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#00f0ff' }}>
                    {r.challenge?.title || r.challengeId}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#ffffff', maxWidth: '280px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.title}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                    {r.user?.username || 'Unknown'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                      {r.severity}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <StatusBadge status={r.status} />
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.785rem' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedReport(r);
                        setReviewAction('approved');
                        setReviewFeedback(r.adminFeedback || '');
                      }}
                      className="btn btn-outline-cyan btn-sm"
                      style={{ fontSize: '0.785rem' }}
                    >
                      <Eye size={13} /> Triage & Grade
                    </button>
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No reports match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal Dialog */}
      {selectedReport && (
        <div className="modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-cyan">{selectedReport.challengeId}</span>
                <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginTop: '0.35rem' }}>
                  {selectedReport.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Submitted by <strong>{selectedReport.user?.username}</strong> ({selectedReport.user?.college})
                </p>
              </div>
              <StatusBadge status={selectedReport.status} />
            </div>

            {/* Reproduction Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ background: '#080c1a', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
                <strong style={{ color: '#00f0ff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Reproduction Steps:</strong>
                <p style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', marginTop: '0.4rem', lineHeight: 1.6 }}>
                  {selectedReport.reproductionSteps}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: '#080c1a', padding: '0.85rem', borderRadius: '8px' }}>
                  <strong style={{ color: '#10b981', fontSize: '0.75rem', textTransform: 'uppercase' }}>Expected Result:</strong>
                  <p style={{ color: '#cbd5e1', marginTop: '0.25rem' }}>{selectedReport.expectedResult}</p>
                </div>
                <div style={{ background: '#080c1a', padding: '0.85rem', borderRadius: '8px' }}>
                  <strong style={{ color: '#f43f5e', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actual Observed:</strong>
                  <p style={{ color: '#cbd5e1', marginTop: '0.25rem' }}>{selectedReport.actualResult}</p>
                </div>
              </div>

              {selectedReport.evidenceText && (
                <div style={{ background: '#05070f', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
                  <strong style={{ color: '#a855f7', fontSize: '0.75rem', textTransform: 'uppercase' }}>Evidence Telemetry Logs:</strong>
                  <pre style={{ fontSize: '0.785rem', color: '#38bdf8', marginTop: '0.35rem', overflowX: 'auto', fontFamily: 'var(--font-mono)' }}>
                    {selectedReport.evidenceText}
                  </pre>
                </div>
              )}

              {/* Review Action Form */}
              <form onSubmit={handleReviewSubmit} style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-dim)', paddingTop: '1rem' }}>
                <label className="form-label">Triage Decision *</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setReviewAction('approved')}
                    className={`btn btn-sm ${reviewAction === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    <CheckCircle size={15} /> Accept & Award Points ({selectedReport.challenge?.points || 10} pts)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('changes_requested')}
                    className={`btn btn-sm ${reviewAction === 'changes_requested' ? 'btn-purple' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    <AlertCircle size={15} /> Request Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('rejected')}
                    className={`btn btn-sm ${reviewAction === 'rejected' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    <XCircle size={15} /> Reject Report
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Judge Feedback {reviewAction !== 'approved' && '* (Required)'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      reviewAction === 'approved'
                        ? 'Confirmed reproducible flaw. Full challenge points awarded!'
                        : 'Explain why reproduction failed or what information is missing...'
                    }
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setSelectedReport(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={reviewing} className="btn btn-primary">
                    {reviewing ? 'Recording Decision...' : 'Save Triage Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Live Audit Log Section */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="#00f0ff" />
          Real-time Platform Audit Log
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {recentLogs.map((log) => (
            <div
              key={log._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.85rem',
                background: '#070a14',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-purple font-mono" style={{ fontSize: '0.68rem' }}>
                  {log.action}
                </span>
                <span style={{ color: '#ffffff' }}>Actor: {log.actor?.username || 'System'}</span>
                <span style={{ color: '#64748b' }}>Target: {log.targetType}</span>
              </div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                {new Date(log.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
