import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { challengesApi } from '../api/client.js';
import { DifficultyBadge, StatusBadge } from '../components/Badge.jsx';
import {
  Search,
  Filter,
  Flame,
  Terminal,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Zap
} from 'lucide-react';

export const ChallengeExplorerPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    challengesApi.getAll()
      .then((res) => {
        if (res.challenges) setChallenges(res.challenges);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(challenges.map((c) => c.category))];

  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesDifficulty = difficultyFilter === 'all' || c.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-cyan">TOURNAMENT CATALOG</span>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>• 12 Seeded Challenges</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', color: '#ffffff' }}>
          Challenge <span className="gradient-text">Explorer</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '680px', marginTop: '0.25rem' }}>
          Explore reproducible frontend flaws in Glitch Lab. Filter by difficulty tier, category, or completion status. Points are awarded upon admin verification.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        padding: '1.25rem',
        background: '#0a0f22',
        borderRadius: '12px',
        border: '1px solid var(--border-dim)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search challenge by name, category, or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Difficulty Filter Pills */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {['all', 'easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`btn btn-sm ${difficultyFilter === d ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {d === 'all' ? 'All Tiers' : d}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="all">All Categories</option>
            {categories.filter((cat) => cat !== 'all').map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="all">All Statuses</option>
            <option value="unattempted">Unattempted</option>
            <option value="attempted">Attempted</option>
            <option value="solved">Solved</option>
          </select>
        </div>

        {/* Results counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          <span>Showing {filteredChallenges.length} of {challenges.length} vulnerabilities</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ color: '#10b981' }}>Easy (10 pts)</span> •{' '}
            <span style={{ color: '#f59e0b' }}>Medium (25 pts)</span> •{' '}
            <span style={{ color: '#f43f5e' }}>Hard (50 pts)</span>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Loading seeded challenge catalog...
        </div>
      ) : filteredChallenges.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredChallenges.map((c) => (
            <div
              key={c.challengeId}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${
                  c.difficulty === 'easy' ? '#10b981' :
                  c.difficulty === 'medium' ? '#f59e0b' : '#f43f5e'
                }`
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <DifficultyBadge difficulty={c.difficulty} />
                  <StatusBadge status={c.status} />
                </div>

                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.4rem' }}>
                  {c.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {c.summary}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                    {c.category}
                  </span>
                  {(c.tags || []).slice(0, 3).map((t, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8'
                    }}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.85rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                gap: '0.5rem'
              }}>
                <Link
                  to={`/challenges/${c.challengeId}`}
                  className="btn btn-secondary btn-sm"
                >
                  Details & Hints
                </Link>

                <Link
                  to={`/glitch-lab?challenge=${c.challengeId}`}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Terminal size={14} /> Launch Lab
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          color: '#64748b'
        }}>
          No challenges match your active filters. Try clearing your search keyword or selecting "All Tiers".
        </div>
      )}
    </div>
  );
};
