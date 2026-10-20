import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../api/client.js';
import { StatusBadge, DifficultyBadge } from '../components/Badge.jsx';
import {
  FileText,
  Clock,
  MessageSquare,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.getMyReports()
      .then((res) => {
        if (res.reports) setReports(res.reports);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-cyan">REPORT TRACKER</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#ffffff' }}>
            My Bug <span className="gradient-text">Reports</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Monitor review status, points credited, and judge feedback on your submissions.
          </p>
        </div>

        <Link to="/submit-report" className="btn btn-primary">
          <PlusCircle size={16} /> File New Bug Report
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-dim)',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }}>
        {[
          { key: 'all', label: `All Reports (${reports.length})` },
          { key: 'pending', label: `In Review (${reports.filter((r) => r.status === 'pending').length})` },
          { key: 'approved', label: `Approved (${reports.filter((r) => r.status === 'approved').length})` },
          { key: 'changes_requested', label: `Changes Requested (${reports.filter((r) => r.status === 'changes_requested').length})` },
          { key: 'rejected', label: `Rejected (${reports.filter((r) => r.status === 'rejected').length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`btn btn-sm ${statusFilter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Loading your bug reports...
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map((report) => (
            <div
              key={report._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderLeft: `4px solid ${
                  report.status === 'approved' ? '#10b981' :
                  report.status === 'rejected' ? '#f43f5e' :
                  report.status === 'changes_requested' ? '#a855f7' : '#f59e0b'
                }`
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <StatusBadge status={report.status} />
                  <span className="badge badge-purple">{report.category}</span>
                  <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                    Severity: {report.severity}
                  </span>
                  <span style={{ fontSize: '0.785rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} /> {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {report.pointsAwarded > 0 && (
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    +{report.pointsAwarded} PTS
                  </span>
                )}
              </div>

              {/* Title & Challenge */}
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.3rem' }}>
                  {report.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#00f0ff' }}>
                  Target: <strong>{report.challenge?.title || report.challengeId}</strong>
                </p>
              </div>

              {/* Reproduction steps summary */}
              <div style={{
                background: '#080c1a',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-dim)',
                fontSize: '0.85rem',
                color: '#cbd5e1'
              }}>
                <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Submitted Reproduction Steps:
                </strong>
                <p style={{ whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                  {report.reproductionSteps}
                </p>
              </div>

              {/* Admin feedback box (if provided) */}
              {report.adminFeedback && (
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: report.status === 'approved' ? 'rgba(16, 185, 129, 0.08)' :
                              report.status === 'changes_requested' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid ' + (
                    report.status === 'approved' ? 'rgba(16, 185, 129, 0.3)' :
                    report.status === 'changes_requested' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(244, 63, 94, 0.3)'
                  ),
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <MessageSquare size={16} color={report.status === 'approved' ? '#10b981' : report.status === 'changes_requested' ? '#a855f7' : '#f43f5e'} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: '#ffffff', textTransform: 'uppercase' }}>
                      Admin Judge Feedback:
                    </strong>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      {report.adminFeedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '3.5rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          color: '#64748b'
        }}>
          No bug reports in this category. Go to{' '}
          <Link to="/glitch-lab" style={{ color: '#00f0ff', fontWeight: 600 }}>
            Glitch Lab
          </Link>{' '}
          to test reproducible bugs and submit your findings!
        </div>
      )}
    </div>
  );
};
