import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, accent = 'cyan' }) => {
  const accentGlow = {
    cyan: 'rgba(0, 240, 255, 0.15)',
    purple: 'rgba(139, 92, 246, 0.15)',
    green: 'rgba(16, 185, 129, 0.15)',
    amber: 'rgba(245, 158, 11, 0.15)',
    rose: 'rgba(244, 63, 94, 0.15)'
  }[accent] || 'rgba(0, 240, 255, 0.15)';

  const accentColor = {
    cyan: '#00f0ff',
    purple: '#a855f7',
    green: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e'
  }[accent] || '#00f0ff';

  return (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      padding: '1.25rem 1.5rem',
      borderLeft: `4px solid ${accentColor}`,
      boxShadow: `0 8px 24px ${accentGlow}`
    }}>
      {Icon && (
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${accentGlow} 0%, rgba(255, 255, 255, 0.03) 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
          flexShrink: 0
        }}>
          <Icon size={26} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.2rem'
        }}>
          {title}
        </p>
        <h3 style={{
          fontSize: '1.85rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          color: '#ffffff',
          lineHeight: 1.1
        }}>
          {value}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
