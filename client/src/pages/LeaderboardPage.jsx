import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leaderboardApi } from '../api/client.js';
import { Award, Trophy, Medal, Search, Flame, Shield, User } from 'lucide-react';

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaderboardApi.getLeaderboard(1, 100)
      .then((res) => {
        if (res.leaderboard) setLeaderboard(res.leaderboard);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = leaderboard.filter((entry) => {
    const term = searchTerm.toLowerCase();
    return (
      entry.username.toLowerCase().includes(term) ||
      (entry.college && entry.college.toLowerCase().includes(term))
    );
  });

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
          <span className="badge badge-purple">LIVE TOURNAMENT STANDINGS</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '0.5rem' }}>
          Elite Bug Hunter <span className="gradient-text">Leaderboard</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Rankings are calculated dynamically from verified, accepted bug reports. Ties broken by verified solve counts.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%'
        }}>
          {top3.map((entrant, index) => {
            const podiumInfo = [
              { color: '#fbbf24', label: '1ST PLACE', border: 'rgba(251, 191, 36, 0.4)', glow: 'rgba(251, 191, 36, 0.2)' },
              { color: '#94a3b8', label: '2ND PLACE', border: 'rgba(148, 163, 184, 0.4)', glow: 'rgba(148, 163, 184, 0.15)' },
              { color: '#f97316', label: '3RD PLACE', border: 'rgba(249, 115, 22, 0.4)', glow: 'rgba(249, 115, 22, 0.15)' }
            ][index] || { color: '#00f0ff', label: 'RUNNER UP', border: 'var(--border-dim)', glow: 'none' };

            return (
              <div
                key={entrant.id}
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '2rem 1.5rem',
                  border: `1px solid ${podiumInfo.border}`,
                  boxShadow: `0 10px 30px ${podiumInfo.glow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  order: index === 0 ? 2 : index === 1 ? 1 : 3
                }}
              >
                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${podiumInfo.color} 0%, rgba(255,255,255,0.2) 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '1.3rem',
                  marginBottom: '1rem',
                  boxShadow: `0 0 20px ${podiumInfo.color}`
                }}>
                  {index + 1}
                </div>

                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: podiumInfo.color, letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                  {podiumInfo.label}
                </span>

                <Link to={`/profile/${entrant.username}`} style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>
                  {entrant.username}
                </Link>

                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                  {entrant.college || 'Bug Arena Academy'}
                </p>

                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: '#00f0ff',
                  lineHeight: 1
                }}>
                  {entrant.points} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>PTS</span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  {entrant.solvedCount} Bugs Solved • {entrant.badgesCount} Badges
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search Bar */}
      <div style={{
        maxWidth: '540px',
        margin: '0 auto',
        width: '100%',
        position: 'relative'
      }}>
        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input
          type="text"
          placeholder="Filter contestants by name or university..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '2.8rem' }}
        />
      </div>

      {/* Full Leaderboard Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#0a0e1e', borderBottom: '1px solid var(--border-dim)', color: '#94a3b8' }}>
                <th style={{ padding: '1rem', width: '80px', textAlign: 'center' }}>Rank</th>
                <th style={{ padding: '1rem' }}>Competitor</th>
                <th style={{ padding: '1rem' }}>Institution</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Solved Bugs</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Badges</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entrant) => (
                <tr
                  key={entrant.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: entrant.rank === 1 ? 'rgba(251, 191, 36, 0.03)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: entrant.rank <= 3 ? '#00f0ff' : '#94a3b8' }}>
                    #{entrant.rank}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Link
                      to={`/profile/${entrant.username}`}
                      style={{ fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#00f0ff',
                        fontSize: '0.75rem'
                      }}>
                        {entrant.username.slice(0, 2).toUpperCase()}
                      </div>
                      {entrant.username}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem', color: '#94a3b8' }}>
                    {entrant.college || 'Bug Arena Academy'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
                    {entrant.solvedCount}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                      <Shield size={11} /> {entrant.badgesCount}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.05rem', color: '#00f0ff' }}>
                    {entrant.points} PTS
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No competitors match the search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
