import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { GlitchLogo } from './GlitchLogo.jsx';
import { AssistantModal } from './AssistantModal.jsx';
import {
  ShieldAlert,
  Flame,
  Award,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Bot,
  Terminal,
  Zap,
  Sliders
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(7, 9, 17, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem'
        }}>
          {/* Brand Logo */}
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <GlitchLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <div style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.75rem'
          }} className="desktop-links">
            <Link
              to="/challenges"
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/challenges') ? '#00f0ff' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'color 0.2s'
              }}
            >
              <Flame size={16} color={isActive('/challenges') ? '#00f0ff' : '#94a3b8'} />
              Challenges
            </Link>

            <Link
              to="/glitch-lab"
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/glitch-lab') ? '#00f0ff' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: isActive('/glitch-lab') ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid ' + (isActive('/glitch-lab') ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)')
              }}
            >
              <Terminal size={16} color="#00f0ff" />
              Glitch Lab
            </Link>

            <Link
              to="/leaderboard"
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/leaderboard') ? '#00f0ff' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'color 0.2s'
              }}
            >
              <Award size={16} color={isActive('/leaderboard') ? '#00f0ff' : '#94a3b8'} />
              Leaderboard
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-reports"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive('/my-reports') ? '#00f0ff' : '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'color 0.2s'
                }}
              >
                <FileText size={16} color={isActive('/my-reports') ? '#00f0ff' : '#94a3b8'} />
                My Reports
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#a855f7',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Sliders size={14} />
                Admin Console
              </Link>
            )}
          </div>

          {/* Right Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Assistant Trigger */}
            <button
              onClick={() => setAssistantOpen(true)}
              className="btn btn-secondary btn-sm"
              title="Open GlitchAssist Copilot"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                color: '#00f0ff'
              }}
            >
              <Bot size={16} />
              <span className="hidden-mobile">GlitchAssist</span>
            </button>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Points Pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#00f0ff'
                }}>
                  <Zap size={14} />
                  <span>{user.points || 0} PTS</span>
                </div>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <User size={15} />
                  <span className="hidden-mobile">{user.username}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Logout"
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  <LogOut size={16} color="#f43f5e" />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-toggle"
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '0.4rem'
              }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div style={{
            padding: '1.25rem 1.5rem',
            background: '#090d1a',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <Link
              to="/challenges"
              onClick={() => setMobileOpen(false)}
              style={{ color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Flame size={18} color="#00f0ff" /> Challenges
            </Link>
            <Link
              to="/glitch-lab"
              onClick={() => setMobileOpen(false)}
              style={{ color: '#00f0ff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Terminal size={18} color="#00f0ff" /> Glitch Lab Simulator
            </Link>
            <Link
              to="/leaderboard"
              onClick={() => setMobileOpen(false)}
              style={{ color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Award size={18} color="#a855f7" /> Leaderboard
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  style={{ color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Zap size={18} color="#10b981" /> Dashboard
                </Link>
                <Link
                  to="/my-reports"
                  onClick={() => setMobileOpen(false)}
                  style={{ color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FileText size={18} color="#38bdf8" /> My Reports
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  style={{ color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <User size={18} color="#cbd5e1" /> My Profile
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                style={{ color: '#a855f7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Sliders size={18} color="#a855f7" /> Admin Console
              </Link>
            )}
          </div>
        )}

        <style>{`
          @media (min-width: 860px) {
            .desktop-links { display: flex !important; }
            .mobile-toggle { display: none !important; }
          }
          @media (max-width: 859px) {
            .desktop-links { display: none !important; }
            .mobile-toggle { display: block !important; }
            .hidden-mobile { display: none !important; }
          }
        `}</style>
      </nav>

      {/* Global Diagnostic Assistant Modal */}
      <AssistantModal
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        challengeId="sorting-glitch"
        challengeTitle="Sorting Glitch"
      />
    </>
  );
};
