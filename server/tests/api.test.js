import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Challenge } from '../src/models/Challenge.js';
import { BugReport } from '../src/models/BugReport.js';
import { ChallengeProgress } from '../src/models/ChallengeProgress.js';
import { seededChallenges } from '../src/data/seedChallenges.js';

describe('BUG ARENA Backend API Test Suite', () => {
  let adminToken = '';
  let participantToken = '';
  let participantId = '';
  let testChallengeId = 'sorting-glitch';
  let createdReportId = '';

  beforeAll(async () => {
    await connectDB();
    // Clean test state
    await User.deleteMany({ email: /test.*@example\.com/ });
    await BugReport.deleteMany({ title: /Test Report/ });
    await ChallengeProgress.deleteMany({});

    // Ensure challenges exist
    const count = await Challenge.countDocuments();
    if (count === 0) {
      await Challenge.insertMany(seededChallenges);
    }
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test.*@example\.com/ });
    await BugReport.deleteMany({ title: /Test Report/ });
    await disconnectDB();
  });

  // 1. AUTHENTICATION & REGISTRATION
  describe('Authentication System', () => {
    it('should register a new participant user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'test_cadet_99',
          email: 'test_cadet_99@example.com',
          password: 'Password123!',
          college: 'Cyber Tech Univ'
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('test_cadet_99');
      expect(res.body.user.role).toBe('participant');
      participantToken = res.body.token;
      participantId = res.body.user.id;
    });

    it('should reject registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'another_user',
          email: 'test_cadet_99@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    it('should reject registration with invalid email or short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'bad',
          email: 'not-an-email',
          password: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should login an existing user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test_cadet_99@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test_cadet_99@example.com');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test_cadet_99@example.com',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid credentials');
    });

    it('should create and login admin user', async () => {
      const admin = new User({
        username: 'test_admin_hero',
        email: 'test_admin_hero@example.com',
        password: 'AdminPassword123!',
        role: 'admin'
      });
      await admin.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test_admin_hero@example.com',
          password: 'AdminPassword123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });
  });

  // 2. CHALLENGES & HINTS
  describe('Challenge Exploration & Progressive Hints', () => {
    it('should fetch all 12 seeded challenges', async () => {
      const res = await request(app).get('/api/challenges');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.challenges)).toBe(true);
      expect(res.body.challenges.length).toBeGreaterThanOrEqual(12);
    });

    it('should fetch single challenge without exposing locked hint texts', async () => {
      const res = await request(app)
        .get(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${participantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.challenge.challengeId).toBe(testChallengeId);
      // All hints should initially have text: null
      res.body.challenge.hints.forEach(h => {
        expect(h.isUnlocked).toBe(false);
        expect(h.text).toBeNull();
      });
    });

    it('should unlock Hint Tier 1 and return its text', async () => {
      const res = await request(app)
        .post(`/api/challenges/${testChallengeId}/hint`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ tier: 1 });

      expect(res.status).toBe(200);
      expect(res.body.hint.tier).toBe(1);
      expect(res.body.hint.isUnlocked).toBe(true);
      expect(typeof res.body.hint.text).toBe('string');
      expect(res.body.hint.text.length).toBeGreaterThan(5);
    });

    it('should prevent skipping progressive hints (Tier 3 without Tier 2)', async () => {
      const res = await request(app)
        .post(`/api/challenges/${testChallengeId}/hint`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ tier: 3 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('You must unlock Hint Tier 2 before unlocking Tier 3');
    });

    it('should unlock Hint Tier 2 successfully after Tier 1', async () => {
      const res = await request(app)
        .post(`/api/challenges/${testChallengeId}/hint`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ tier: 2 });

      expect(res.status).toBe(200);
      expect(res.body.hint.tier).toBe(2);
      expect(res.body.hint.isUnlocked).toBe(true);
    });
  });

  // 3. DETERMINISTIC ASSISTANT
  describe('Deterministic Assistant (GlitchAssist)', () => {
    it('should provide deterministic reproduction guidance without external API keys', async () => {
      const res = await request(app)
        .post('/api/assistant/chat')
        .send({
          challengeId: 'sorting-glitch',
          message: 'How do I reproduce this sorting error?'
        });

      expect(res.status).toBe(200);
      expect(res.body.assistant.name).toContain('GlitchAssist');
      expect(res.body.assistant.reply).toContain('Sorting Glitch');
      expect(Array.isArray(res.body.assistant.keyConcepts)).toBe(true);
    });
  });

  // 4. BUG REPORT SUBMISSION & USER REPORTS
  describe('Bug Report Workflow', () => {
    it('should submit a valid bug report', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({
          challengeId: testChallengeId,
          title: 'Test Report: Lexicographical sorting discrepancy on latency',
          category: 'UI & Data Sorting',
          severity: 'medium',
          reproductionSteps: 'Step 1: Open Latency Monitor. Step 2: Click sort latency header. Step 3: Observe 120ms before 9ms.',
          expectedResult: '9ms should appear before 120ms in ascending numerical order.',
          actualResult: '120ms is placed first because string "1" precedes string "9".',
          evidenceText: 'Array.prototype.sort() missing comparator callback.'
        });

      expect(res.status).toBe(201);
      expect(res.body.report.status).toBe('pending');
      createdReportId = res.body.report.id;
    });

    it('should reject duplicate pending report for same challenge', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({
          challengeId: testChallengeId,
          title: 'Test Report: Duplicate submission attempt',
          category: 'UI & Data Sorting',
          severity: 'medium',
          reproductionSteps: 'Step 1: Attempt to resubmit same challenge while pending.',
          expectedResult: 'System should reject duplicate submission.',
          actualResult: 'System should block duplicate reports.',
          evidenceText: 'Duplicate check verification.'
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already have a pending report');
    });

    it('should list submitted reports in My Reports', async () => {
      const res = await request(app)
        .get('/api/reports/my')
        .set('Authorization', `Bearer ${participantToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.reports)).toBe(true);
      expect(res.body.reports.some(r => r._id === createdReportId)).toBe(true);
    });
  });

  // 5. ADMIN REVIEW, POINTS, & DUPLICATE PREVENTION
  describe('Admin Evaluation & Points Security', () => {
    it('should forbid non-admin from accessing admin endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${participantToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Administrator privileges required');
    });

    it('should allow admin to view stats and report queue', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.totalUsers).toBeGreaterThanOrEqual(1);
    });

    it('should require feedback when rejecting a report', async () => {
      const res = await request(app)
        .put(`/api/admin/reports/${createdReportId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected',
          adminFeedback: '' // Missing required feedback
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('feedback is required');
    });

    it('should approve report, award points, and prevent duplicate points', async () => {
      // 1. Approve report
      const approveRes = await request(app)
        .put(`/api/admin/reports/${createdReportId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved',
          adminFeedback: 'Excellent verification steps and root cause analysis.'
        });

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.report.status).toBe('approved');
      expect(approveRes.body.report.pointsAwarded).toBe(10); // 10 pts for Easy challenge

      // Verify user points increased
      const userRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${participantToken}`);

      expect(userRes.status).toBe(200);
      expect(userRes.body.user.points).toBe(10);
      expect(userRes.body.user.badges.some(b => b.id === 'first-blood')).toBe(true);

      // Verify user cannot submit another report for this solved challenge
      const duplicateSubmitRes = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({
          challengeId: testChallengeId,
          title: 'Test Report: Second attempt after already approved',
          category: 'UI & Data Sorting',
          severity: 'medium',
          reproductionSteps: 'Step 1: Attempt to resubmit same challenge after solve.',
          expectedResult: 'System should reject duplicate submission.',
          actualResult: 'System blocks submission.',
          evidenceText: 'Duplicate check verification.'
        });

      expect(duplicateSubmitRes.status).toBe(409);
      expect(duplicateSubmitRes.body.error).toContain('already solved this challenge');
    });
  });

  // 6. LEADERBOARD & PROFILE
  describe('Leaderboard & Profile Accuracy', () => {
    it('should reflect points and rankings on the leaderboard', async () => {
      const res = await request(app).get('/api/leaderboard');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.leaderboard)).toBe(true);

      const entrant = res.body.leaderboard.find(p => p.username === 'test_cadet_99');
      expect(entrant).toBeDefined();
      expect(entrant.points).toBe(10);
      expect(entrant.solvedCount).toBe(1);
    });

    it('should return complete user profile with achievements', async () => {
      const res = await request(app)
        .get('/api/profile/me')
        .set('Authorization', `Bearer ${participantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.profile.username).toBe('test_cadet_99');
      expect(res.body.profile.points).toBe(10);
      expect(res.body.profile.stats.approvedReports).toBe(1);
      expect(Array.isArray(res.body.profile.badges)).toBe(true);
    });
  });
});
