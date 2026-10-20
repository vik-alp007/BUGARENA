import React from 'react';

export const GlitchLogo = ({ size = 'md' }) => {
  const sizeMap = {
    sm: { icon: 20, font: '1.1rem' },
    md: { icon: 26, font: '1.4rem' },
    lg: { icon: 34, font: '1.9rem' }
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', userSelect: 'none' }}>
      <div style={{
        position: 'relative',
        width: dim.icon + 10,
        height: dim.icon + 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(139, 92, 246, 0.2) 100%)',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)'
      }}>
        <svg
          width={dim.icon}
          height={dim.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="8" y="6" width="8" height="12" rx="4" />
          <path d="m19 7-3 3" />
          <path d="m5 7 3 3" />
          <path d="m19 19-3-3" />
          <path d="m5 19 3-3" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{
          fontSize: dim.font,
          fontWeight: 900,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(90deg, #ffffff 0%, #00f0ff 60%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          BUG ARENA
        </span>
        <span style={{
          fontSize: '0.625rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#94a3b8',
          textTransform: 'uppercase'
        }}>
          Ultimate Bug Hunt
        </span>
      </div>
    </div>
  );
};
