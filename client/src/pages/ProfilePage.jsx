import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profileApi, authApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { DifficultyBadge, StatusBadge } from '../components/Badge.jsx';
import {
  User,
  Shield,
  Award,
  Zap,
  School,
  Edit3,
  Calendar,
  CheckCircle,
  FileText,
  Clock,
  Terminal
} from 'lucide-react';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: authUser, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editCollege, setEditCollege] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwnProfile = !username || (authUser && authUser.username === username);

  const fetchProfileData = () => {
    const apiCall = username ? profileApi.getByUsername(username) : profileApi.getMyProfile();
    apiCall
      .then((res) => {
        if (res.profile) {
          setProfile(res.profile);
          setEditCollege(res.profile.college || '');
          setEditBio(res.profile.bio || '');
        }
      })
      .catch((err) => toastError(err.message || 'Profile not found.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({ college: editCollege, bio: editBio });
      success('Profile updated successfully.');
      setEditOpen(false);
      fetchProfileData();
      refreshUser();
    } catch (err) {
      toastError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading competitor profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ color: '#ffffff' }}>Competitor Not Found</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Profile Header Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar Icon */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(139, 92, 246, 0.3) 100%)',
            border: '2px solid #00f0ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00f0ff',
            fontSize: '2rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.25)'
          }}>
            {profile.username.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-cyan">{profile.role.toUpperCase()}</span>
              {profile.email && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• {profile.email}</span>}
            </div>

            <h1 style={{ fontSize: '2.25rem', color: '#ffffff', lineHeight: 1.1 }}>
              {profile.username}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <School size={15} color="#00f0ff" /> {profile.college || 'Bug Arena Academy'}
              </span>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem', maxWidth: '540px' }}>
              {profile.bio || 'Cybersecurity competitor, hunting vulnerabilities across the Glitch Lab arena.'}
            </p>
          </div>
        </div>

        {/* Action / Rank Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Tournament Rank
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#00f0ff', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
              #{profile.rank}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#a855f7', fontWeight: 700 }}>
              {profile.points} TOTAL POINTS
            </div>
          </div>

          {isOwnProfile && (
            <button
              onClick={() => setEditOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Edit3 size={14} /> Edit Bio
            </button>
          )}
        </div>
      </div>

      {/* Badges & Accolades */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} color="#00f0ff" />
          Earned Badges & Honors ({profile.badges?.length || 0})
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
          {(profile.badges || []).map((badge, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem',
                background: '#090e20',
                borderRadius: '10px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a855f7',
                flexShrink: 0
              }}>
                <Award size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.2rem' }}>
                  {badge.name}
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {badge.description}
                </p>
              </div>
            </div>
          ))}

          {(!profile.badges || profile.badges.length === 0) && (
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
              No badges unlocked yet. Complete challenges to earn badges.
            </div>
          )}
        </div>
      </div>

      {/* Solved Challenges History */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1.25rem' }}>
          Verified Solved Challenges ({profile.solvedChallenges?.length || 0})
        </h3>

        {profile.solvedChallenges?.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {profile.solvedChallenges.map((c) => (
              <div
                key={c._id || c.challengeId}
                style={{
                  padding: '1rem',
                  background: '#080c1a',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <DifficultyBadge difficulty={c.difficulty} />
                    <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ Solved</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', color: '#ffffff' }}>{c.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.category}</p>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>
                  +{c.points} PTS
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No challenges verified yet. Start hunting in{' '}
            <Link to="/glitch-lab" style={{ color: '#00f0ff', fontWeight: 600 }}>
              Glitch Lab
            </Link>!
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="modal-backdrop" onClick={() => setEditOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '1.25rem' }}>
              Edit Competitor Profile
            </h3>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">University / Institution</label>
                <input
                  type="text"
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Stanford Cyber Defense"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Competitor Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="form-textarea"
                  placeholder="Tell the arena about your security focus..."
                  maxLength={200}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
