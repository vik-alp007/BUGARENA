import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { GlitchLogo } from '../components/GlitchLogo.jsx';
import { Lock, Mail, ArrowRight, Shield, User } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      success(`Welcome back, ${res.user.username}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
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
        maxWidth: '460px',
        padding: '2rem',
        background: '#0c1122',
        borderRadius: '16px',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 240, 255, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <GlitchLogo size="md" />
          <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#ffffff' }}>
            Competitor Authentication
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Enter your credentials to access the Bug Arena tournament.
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Arena'}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill */}
        <div style={{
          marginTop: '1.75rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            Instant Demo Account Quick-Fill:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@bugarena.edu', 'AdminPass123!')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem', borderColor: 'rgba(139, 92, 246, 0.3)' }}
            >
              <Shield size={12} color="#a855f7" /> Admin Account
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('neon_hunter@stanford.edu', 'CadetPass123!')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem', borderColor: 'rgba(0, 240, 255, 0.3)' }}
            >
              <User size={12} color="#00f0ff" /> Cadet (Hunter)
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginTop: '1.5rem' }}>
          New competitor?{' '}
          <Link to="/register" style={{ color: '#00f0ff', fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
