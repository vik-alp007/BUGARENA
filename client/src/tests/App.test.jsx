import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App.jsx';
import { SimSortingGlitch } from '../challenges/sim/SimSortingGlitch.jsx';
import { SimPhantomCounter } from '../challenges/sim/SimPhantomCounter.jsx';
import { SimBrokenReset } from '../challenges/sim/SimBrokenReset.jsx';
import { SimValidationGap } from '../challenges/sim/SimValidationGap.jsx';
import { SimCartCalculator } from '../challenges/sim/SimCartCalculator.jsx';
import { SimRaceCondition } from '../challenges/sim/SimRaceCondition.jsx';

describe('BUG ARENA Frontend Integration & Challenge Tests', () => {
  it('renders Bug Arena brand headline on landing page', () => {
    render(<App />);
    expect(screen.getByText(/DISCOVER THE FLAWS/i)).toBeInTheDocument();
    expect(screen.getByText(/OWN THE ARENA/i)).toBeInTheDocument();
  });

  describe('Challenge 1: Sorting Glitch simulation', () => {
    it('reproduces lexicographical string sorting anomaly', () => {
      const logs = [];
      render(<SimSortingGlitch onLogEvent={(e) => logs.push(e)} />);

      // Find sort latency button
      const sortBtn = screen.getByRole('button', { name: /Sort Latency/i });
      fireEvent.click(sortBtn);

      // Verify that lexicographical sort log was emitted
      expect(logs.some((l) => l.type === 'SORT_TRIGGERED')).toBe(true);
      const sortLog = logs.find((l) => l.type === 'SORT_TRIGGERED');
      expect(sortLog.mode).toBe('DEFAULT_STRING (Buggy)');
    });
  });

  describe('Challenge 2: Phantom Counter simulation', () => {
    it('reproduces count desync on batch addition', () => {
      const logs = [];
      render(<SimPhantomCounter onLogEvent={(e) => logs.push(e)} />);

      const batchBtn = screen.getByRole('button', { name: /Batch Add VIP Squad/i });
      fireEvent.click(batchBtn);

      // True count should now be 2 + 5 = 7, but displayed count only grew by 1 to 3
      expect(screen.getByText(/Desync Drift: 4/i)).toBeInTheDocument();
      expect(logs.some((l) => l.type === 'BATCH_ADD')).toBe(true);
    });
  });

  describe('Challenge 3: Broken Reset simulation', () => {
    it('clears query input but retains active track and minRating filters', () => {
      const logs = [];
      render(<SimBrokenReset onLogEvent={(e) => logs.push(e)} />);

      const resetBtn = screen.getByRole('button', { name: /Reset All Filters/i });
      fireEvent.click(resetBtn);

      expect(logs.some((l) => l.type === 'PARTIAL_RESET_EXECUTED')).toBe(true);
    });
  });

  describe('Challenge 4: Validation Gap simulation', () => {
    it('accepts negative team size due to truthy boundary check bypass', () => {
      const logs = [];
      render(<SimValidationGap onLogEvent={(e) => logs.push(e)} />);

      const nameInput = screen.getByPlaceholderText(/e\.g\. RedTeam Echo/i);
      const sizeInput = screen.getByPlaceholderText(/e\.g\. -2/i);
      const submitBtn = screen.getByRole('button', { name: /Enroll Team/i });

      fireEvent.change(nameInput, { target: { value: 'ShadowHacks' } });
      fireEvent.change(sizeInput, { target: { value: '-3' } });
      fireEvent.click(submitBtn);

      expect(logs.some((l) => l.type === 'TEAM_REGISTERED')).toBe(true);
      expect(screen.getByText(/Anomaly: Size Out of Range/i)).toBeInTheDocument();
    });
  });

  describe('Challenge 6: Cart Calculator simulation', () => {
    it('calculates coupon discount against subtotal plus shipping', () => {
      const logs = [];
      render(<SimCartCalculator onLogEvent={(e) => logs.push(e)} />);

      const applyBtn = screen.getByRole('button', { name: /Apply \(BUG20\)/i });
      fireEvent.click(applyBtn);

      expect(logs.some((l) => l.type === 'COUPON_APPLIED')).toBe(true);
      expect(screen.getByText(/BUG20/i)).toBeInTheDocument();
    });
  });

  describe('Challenge 9: Race Condition simulation', () => {
    it('renders search bar and emits async request tracking', () => {
      const logs = [];
      render(<SimRaceCondition onLogEvent={(e) => logs.push(e)} />);

      const autoSeqBtn = screen.getByRole('button', { name: /Auto-Fire Test Sequence/i });
      fireEvent.click(autoSeqBtn);

      expect(logs.some((l) => l.type === 'ASYNC_REQUEST_DISPATCHED')).toBe(true);
    });
  });
});
