import React from 'react';
import { Link } from 'react-router-dom';
import { GlitchLogo } from './GlitchLogo.jsx';
import { ShieldCheck, Terminal, Heart, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      background: '#05070e',
      padding: '3rem 0 2rem 0'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Brand info */}
          <div>
            <GlitchLogo size="sm" />
            <p style={{
              fontSize: '0.85rem',
              color: '#94a3b8',
              marginTop: '1rem',
              lineHeight: 1.6
            }}>
              The premier collegiate bug hunting tournament. Discover synthetic vulnerabilities in isolated simulation environments, submit reproduction proofs, and climb the elite leaderboard.
            </p>
            <div style={{
              marginTop: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              ARENA ENGINE ONLINE • v2.4.0
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 style={{ fontSize: '0.9rem', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              Competition
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <li><Link to="/challenges" style={{ transition: 'color 0.2s' }}>Challenge Catalog (12 Seeded)</Link></li>
              <li><Link to="/glitch-lab" style={{ transition: 'color 0.2s' }}>Glitch Lab Interactive Sandbox</Link></li>
              <li><Link to="/leaderboard" style={{ transition: 'color 0.2s' }}>Real-time Leaderboard</Link></li>
              <li><Link to="/submit-report" style={{ transition: 'color 0.2s' }}>File Bug Report</Link></li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h5 style={{ fontSize: '0.9rem', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              Rules of Engagement
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="#00f0ff" /> Isolated sandbox testing only
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="#00f0ff" /> No automated DoS attacks
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="#00f0ff" /> Detailed reproduction steps required
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="#00f0ff" /> Points awarded on admin verification
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>
            © 2026 BUG ARENA. Built for Cybersecurity Collegiate Competitions.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Confined synthetic challenges</span> • <span>Production platform secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
