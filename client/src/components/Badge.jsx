import React from 'react';

export const DifficultyBadge = ({ difficulty }) => {
  const diff = (difficulty || '').toLowerCase();
  const classNames = {
    easy: 'badge-easy',
    medium: 'badge-medium',
    hard: 'badge-hard'
  };

  const labels = {
    easy: 'Easy • 10 pts',
    medium: 'Medium • 25 pts',
    hard: 'Hard • 50 pts'
  };

  return (
    <span className={`badge ${classNames[diff] || 'badge-gray'}`}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: diff === 'easy' ? '#10b981' : diff === 'medium' ? '#f59e0b' : '#f43f5e',
        display: 'inline-block'
      }} />
      {labels[diff] || difficulty}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const stat = (status || '').toLowerCase();
  const map = {
    pending: { label: 'In Review', cls: 'status-pending' },
    approved: { label: 'Verified & Approved', cls: 'status-approved' },
    rejected: { label: 'Rejected', cls: 'status-rejected' },
    changes_requested: { label: 'Changes Requested', cls: 'status-changes' },
    solved: { label: 'Solved', cls: 'status-approved' },
    attempted: { label: 'Attempted', cls: 'badge-purple' },
    unattempted: { label: 'Unattempted', cls: 'badge-gray' }
  };

  const item = map[stat] || { label: status, cls: 'badge-gray' };

  return (
    <span className={`badge ${item.cls}`}>
      {item.label}
    </span>
  );
};
