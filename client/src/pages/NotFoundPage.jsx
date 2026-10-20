import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, Terminal } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="container" style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        padding: '3rem 2rem',
        maxWidth: '560px',
        background: '#090d1e',
        borderRadius: '16px',
        border: '1px solid rgba(244, 63, 94, 0.4)',
        boxShadow: '0 0 30px rgba(244, 63, 94, 0.15)'
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid #f43f5e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          color: '#f43f5e'
        }}>
          <AlertTriangle size={32} />
        </div>

        <div style={{
          fontSize: '3.5rem',
          fontWeight: 900,
          fontFamily: 'var(--font-heading)',
          color: '#f43f5e',
          lineHeight: 1
        }}>
          404
        </div>

        <h2 style={{ fontSize: '1.5rem', color: '#ffffff', margin: '0.75rem 0' }}>
          Anomaly Detected: Route Null Pointer
        </h2>

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          The requested path could not be resolved in the Bug Arena simulation grid. Either the endpoint has been deprecated or you traversed out of bounds.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> Return to Arena Home
          </Link>
          <Link to="/glitch-lab" className="btn btn-secondary">
            <Terminal size={16} /> Open Glitch Lab
          </Link>
        </div>
      </div>
    </div>
  );
};
