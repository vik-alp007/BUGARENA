import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { profileApi, reportsApi, challengesApi } from '../api/client.js';
import { StatCard } from '../components/StatCard.jsx';
import { StatusBadge, DifficultyBadge } from '../components/Badge.jsx';
import {
  Zap,
  Award,
  CheckCircle,
  FileText,
  Terminal,
  Flame,
  ArrowRight,
  PlusCircle,
  Clock,
  Shield
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      profileApi.getMyProfile().catch(() => ({ profile: null })),
      reportsApi.getMyReports().catch(() => ({ reports: [] })),
      challengesApi.getAll().catch(() => ({ challenges: [] }))
    ])
      .then(([profRes, repRes, chalRes]) => {
        if (profRes?.profile) setProfile(profRes.profile);
        if (repRes?.reports) setRecentReports(repRes.reports.slice(0, 5));
        if (chalRes?.challenges) setChallenges(chalRes.challenges);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalChallenges = 12;
  const solvedCount = profile?.solvedChallenges?.length || user?.solvedChallenges?.length || 0;
  const progressPercent = Math.round((solvedCount / totalChallenges) * 100);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Welcome Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-cyan">HUNTER DASHBOARD</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• {user?.college || 'Cyber Academy'}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#ffffff' }}>
            Welcome back, <span className="gradient-text">{user?.username}</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            {solvedCount} of {totalChallenges} seeded vulnerabilities solved.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/glitch-lab" className="btn btn-primary">
            <Terminal size={16} /> Open Glitch Lab
          </Link>
          <Link to="/submit-report" className="btn btn-secondary">
            <PlusCircle size={16} /> Submit Bug Report
          </Link>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <StatCard
          title="Total Score"
          value={`${profile?.points ?? user?.points ?? 0} PTS`}
          subtitle="Verified points awarded"
          icon={Zap}
          accent="cyan"
        />
        <StatCard
          title="Tournament Rank"
          value={`#${profile?.rank ?? 1}`}
          subtitle="On active leaderboard"
          icon={Award}
          accent="purple"
        />
        <StatCard
          title="Solved Bugs"
          value={`${solvedCount} / ${totalChallenges}`}
          subtitle={`${progressPercent}% completion rate`}
          icon={CheckCircle}
          accent="green"
        />
        <StatCard
          title="Submitted Reports"
          value={profile?.stats?.totalReports ?? recentReports.length}
          subtitle={`${profile?.stats?.approvedReports ?? 0} verified & approved`}
          icon={FileText}
          accent="amber"
        />
      </div>

      {/* Progress & Quick Shortcuts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Progress Bar Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Tournament Progress</h3>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>
              {progressPercent}% COMPLETE
            </span>
          </div>

          <div style={{
            height: '12px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            marginBottom: '1.25rem'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00f0ff 0%, #a855f7 100%)',
              transition: 'width 0.5s ease'
            }} />
          </div>

          {/* Badges preview */}
          <div>
            <h5 style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
              Unlocked Hunter Badges ({user?.badges?.length || 0})
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(user?.badges || []).map((b, i) => (
                <span key={i} className="badge badge-purple" style={{ padding: '0.35rem 0.65rem' }}>
                  <Shield size={12} color="#a855f7" /> {b.name}
                </span>
              ))}
              {(!user?.badges || user.badges.length === 0) && (
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No badges unlocked yet. Solve challenges to earn honors!</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Launch Glitch Lab */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-cyan">SIMULATION SUITE</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Jump into GLITCH LAB
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Test intentional flaws across 12 isolated challenge sandboxes with live console logging, state inspectors, and one-click report prefill.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Link to="/glitch-lab" className="btn btn-primary" style={{ flex: 1 }}>
              <Terminal size={16} /> Open Sandbox
            </Link>
            <Link to="/challenges" className="btn btn-secondary">
              Browse All
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Your Recent Bug Reports</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tracking status and admin feedback</p>
          </div>

          <Link to="/my-reports" className="btn btn-outline-cyan btn-sm">
            View All Reports <ArrowRight size={14} />
          </Link>
        </div>

        {recentReports.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-dim)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Challenge</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Report Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Severity</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#00f0ff', fontWeight: 600 }}>
                      {r.challenge?.title || r.challengeId}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#ffffff' }}>
                      {r.title}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                        {r.severity}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <StatusBadge status={r.status} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: r.pointsAwarded > 0 ? '#10b981' : '#64748b' }}>
                      +{r.pointsAwarded} PTS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            You haven't submitted any bug reports yet.{' '}
            <Link to="/glitch-lab" style={{ color: '#00f0ff', fontWeight: 600 }}>
              Launch Glitch Lab
            </Link>{' '}
            to find your first bug!
          </div>
        )}
      </div>
    </div>
  );
};
