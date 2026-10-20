import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { GlitchLogo } from '../components/GlitchLogo.jsx';
import { User, Mail, Lock, School, Shield } from 'lucide-react';

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(username.trim(), email.trim(), password, college.trim());
      success(`Welcome to BUG ARENA, ${res.user.username}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check input requirements.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2rem',
        background: '#0c1122',
        borderRadius: '16px',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 240, 255, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <GlitchLogo size="md" />
          <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#ffffff' }}>
            Enlist as Competitor
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Register your profile to hunt bugs, submit reports, and earn points.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#f43f5e',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Hunter Handle / Username *</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="e.g. cyber_sleuth"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">University / College Email *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                placeholder="cadet@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">College / Institution</label>
            <div style={{ position: 'relative' }}>
              <School size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="e.g. MIT Cyber Security Lab"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  placeholder="Repeat pass"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {loading ? 'Creating Competitor Account...' : 'Complete Enlistment'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginTop: '1.5rem' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#00f0ff', fontWeight: 600 }}>
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
