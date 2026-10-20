import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leaderboardApi, challengesApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DifficultyBadge } from '../components/Badge.jsx';
import {
  ShieldAlert,
  Flame,
  Terminal,
  Award,
  Zap,
  CheckCircle2,
  Bug,
  Cpu,
  ArrowRight,
  Target,
  Sparkles,
  Layers
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalParticipants: 3,
    totalChallenges: 12,
    approvedReports: 3,
    totalPointsAwarded: 95
  });
  const [featuredChallenges, setFeaturedChallenges] = useState([]);

  useEffect(() => {
    leaderboardApi.getStats()
      .then((res) => {
        if (res.stats) setStats(res.stats);
      })
      .catch((err) => console.warn('Could not fetch stats:', err.message));

    challengesApi.getAll()
      .then((res) => {
        if (res.challenges) setFeaturedChallenges(res.challenges.slice(0, 6));
      })
      .catch((err) => console.warn('Could not fetch challenges:', err.message));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 0 3rem 0',
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          {/* Tournament Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: '#00f0ff',
            fontSize: '0.85rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            marginBottom: '1.75rem',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
          }}>
            <Sparkles size={14} />
            INTERCOLLEGIATE BUG HUNTING CHAMPIONSHIP 2026
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem'
          }}>
            DISCOVER THE FLAWS. <br />
            <span className="gradient-text">OWN THE ARENA.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#94a3b8',
            maxWidth: '720px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6
          }}>
            Step into <strong>GLITCH LAB</strong>, a simulated proving ground riddled with intentional race conditions, state drift, and calculation flaws. Submit reproducible bug reports, earn verified points, and dominate the college leaderboard.
          </p>

          {/* Call to action buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3.5rem'
          }}>
            {isAuthenticated ? (
              <Link to="/glitch-lab" className="btn btn-primary btn-lg">
                <Terminal size={18} /> Launch Glitch Lab Simulator
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">
                <Flame size={18} /> Enlist in the Arena
              </Link>
            )}
            <Link to="/challenges" className="btn btn-secondary btn-lg">
              Explore 12 Challenges <ArrowRight size={16} />
            </Link>
          </div>

          {/* Live Competition Statistics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#00f0ff', fontFamily: 'var(--font-heading)' }}>
                {stats.totalParticipants}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Bug Hunters
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#a855f7', fontFamily: 'var(--font-heading)' }}>
                12
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Seeded Vulnerabilities
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-heading)' }}>
                {stats.approvedReports}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Verified Bug Reports
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'var(--font-heading)' }}>
                {stats.totalPointsAwarded}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Points Awarded
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
            ENGINEERED FOR REALISTIC <span className="text-cyan">BUG HUNTING</span>
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
            No contrived CTF riddles. Experience actual frontend asynchronous flaws, state desync, and calculation edge cases.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: '#00f0ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Terminal size={22} />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: '#ffffff' }}>GLITCH LAB Sandbox</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
              A live simulated web workbench where each challenge runs in complete isolation. Interact with buggy sorting, race conditions, and form states with real telemetry logging.
            </p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={22} />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: '#ffffff' }}>GlitchAssist Copilot</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Deterministic AI-style diagnostic assistant that guides discovery using rule-based reasoning without calling external paid APIs or leaking answers prematurely.
            </p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={22} />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Admin Evaluation Queue</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Bug reports are evaluated by tournament admins. Points (10 Easy, 25 Med, 50 Hard) are awarded securely with strict anti-duplicate submission protection.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        background: 'linear-gradient(180deg, rgba(14, 18, 34, 0.5) 0%, rgba(7, 8, 15, 0.8) 100%)',
        padding: '4rem 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              HOW TO COMPETE & <span className="gradient-text">WIN</span>
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
              Four simple steps from registration to the top of the collegiate leaderboard.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              { step: '01', title: 'Pick a Challenge', desc: 'Choose from 12 challenges categorized into Easy, Medium, and Hard tiers.' },
              { step: '02', title: 'Test in Glitch Lab', desc: 'Launch the interactive simulation, execute edge cases, and inspect the telemetry console.' },
              { step: '03', title: 'File Bug Report', desc: 'Draft clear, step-by-step reproduction steps with expected vs actual results.' },
              { step: '04', title: 'Earn Points & Badges', desc: 'Once verified by an admin, points are credited to your profile and the leaderboard.' }
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  padding: '1.5rem',
                  background: '#0a0f22',
                  borderRadius: '10px',
                  border: '1px solid var(--border-dim)',
                  position: 'relative'
                }}
              >
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: 'rgba(0, 240, 255, 0.25)',
                  marginBottom: '0.5rem',
                  lineHeight: 1
                }}>
                  {s.step}
                </div>
                <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.4rem' }}>{s.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Challenges Showcase */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
              FEATURED <span className="text-cyan">CHALLENGES</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Preview some of the intentional flaws waiting to be discovered.
            </p>
          </div>

          <Link to="/challenges" className="btn btn-outline-cyan btn-sm">
            View All 12 Challenges <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {featuredChallenges.map((c) => (
            <div key={c.challengeId} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <DifficultyBadge difficulty={c.difficulty} />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    #{c.order.toString().padStart(2, '0')}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                  {c.title}
                </h4>

                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {c.summary}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                  {c.category}
                </span>

                <Link to={`/glitch-lab?challenge=${c.challengeId}`} className="btn btn-primary btn-sm">
                  Launch Lab
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="container">
        <div style={{
          padding: '3rem 2rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(139, 92, 246, 0.15) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
        }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>
            READY TO HUNT YOUR FIRST BUG?
          </h2>
          <p style={{ color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1rem' }}>
            Create your account today, inspect the simulations in Glitch Lab, and prove your cybersecurity skills on the live leaderboard.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Register Competitor Profile
            </Link>
            <Link to="/glitch-lab" className="btn btn-secondary btn-lg">
              Explore Glitch Lab Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
