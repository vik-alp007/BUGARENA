// Complete End-to-End Live Workflow Verification Script
const BASE_URL = 'http://localhost:5001/api';

const log = (step, msg) => console.log(`\x1b[36m[STEP ${step}]\x1b[0m ${msg}`);
const pass = (msg) => console.log(`  \x1b[32m✓ ${msg}\x1b[0m`);
const fail = (msg) => { console.error(`  \x1b[31m✗ ${msg}\x1b[0m`); process.exit(1); };

async function runE2E() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING BUG ARENA LIVE END-TO-END WORKFLOW TEST');
  console.log('======================================================\n');

  // 1. Health Check
  log(1, 'Verifying Backend Server Health Endpoint...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  if (health.status === 'ok') {
    pass(`Health OK: ${health.service} at ${health.timestamp}`);
  } else {
    fail('Health check failed');
  }

  // 2. Register New Cadet
  log(2, 'Registering new competitor profile...');
  const testUser = `cadet_${Date.now().toString().slice(-5)}`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: testUser,
      email: `${testUser}@berkeley.edu`,
      password: 'LivePassword123!',
      college: 'UC Berkeley EECS'
    })
  });
  const regData = await regRes.json();
  if (regRes.status !== 201 || !regData.token) fail(`Registration failed: ${JSON.stringify(regData)}`);
  const cadetToken = regData.token;
  pass(`Registered cadet "${testUser}" with initial points: ${regData.user.points}`);

  // 3. Explore Catalog
  log(3, 'Fetching 12 Seeded Challenges with Cadet Progress...');
  const chalRes = await fetch(`${BASE_URL}/challenges`, {
    headers: { Authorization: `Bearer ${cadetToken}` }
  });
  const chalData = await chalRes.json();
  if (!chalData.challenges || chalData.challenges.length < 12) fail('Challenges catalog incomplete');
  pass(`Retrieved ${chalData.challenges.length} active seeded challenges`);

  // 4. Progressive Hint Unlocking
  log(4, 'Unlocking progressive hint tier 1 for sorting-glitch...');
  const hintRes = await fetch(`${BASE_URL}/challenges/sorting-glitch/hint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cadetToken}`
    },
    body: JSON.stringify({ tier: 1 })
  });
  const hintData = await hintRes.json();
  if (hintRes.status !== 200 || !hintData.hint.text) fail(`Hint unlock failed: ${JSON.stringify(hintData)}`);
  pass(`Unlocked Hint Tier 1: "${hintData.hint.title}" -> "${hintData.hint.text.slice(0, 45)}..."`);

  // 5. Deterministic AI Assistant
  log(5, 'Consulting GlitchAssist Deterministic Copilot...');
  const assistRes = await fetch(`${BASE_URL}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challengeId: 'sorting-glitch',
      message: 'How do I reproduce this sorting glitch?'
    })
  });
  const assistData = await assistRes.json();
  if (!assistData.assistant.reply.includes('Sorting Glitch')) fail('Assistant reply malformed');
  pass(`GlitchAssist Response Type: ${assistData.assistant.responseType} (${assistData.assistant.name})`);

  // 6. Submit Bug Report
  log(6, 'Submitting reproducible bug report for sorting-glitch...');
  const repRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cadetToken}`
    },
    body: JSON.stringify({
      challengeId: 'sorting-glitch',
      title: 'Lexicographical sorting discrepancy on latency column',
      category: 'UI & Data Sorting',
      severity: 'medium',
      reproductionSteps: 'Step 1: Launch Latency Monitor. Step 2: Click sort latency header. Step 3: Observe 120ms before 25ms.',
      expectedResult: '9ms should precede 25ms and 120ms in ascending order.',
      actualResult: 'Table orders strings lexicographically ("120" < "25" < "9").',
      evidenceText: 'Array.prototype.sort() missing numeric comparator callback.'
    })
  });
  const repData = await repRes.json();
  if (repRes.status !== 201 || !repData.report.id) fail(`Bug report submission failed: ${JSON.stringify(repData)}`);
  const reportId = repData.report.id;
  pass(`Report created successfully in pending status: ID ${reportId}`);

  // 7. Verify Duplicate Submission Prevention
  log(7, 'Testing duplicate submission prevention...');
  const dupRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cadetToken}`
    },
    body: JSON.stringify({
      challengeId: 'sorting-glitch',
      title: 'Duplicate attempt while pending',
      category: 'UI & Data Sorting',
      severity: 'medium',
      reproductionSteps: 'Attempt duplicate submission while previous is pending.',
      expectedResult: 'Should be rejected.',
      actualResult: 'Should be blocked.',
      evidenceText: 'Verification check.'
    })
  });
  if (dupRes.status !== 409) fail('Failed to block duplicate pending submission');
  pass('Duplicate submission successfully rejected with 409 Conflict');

  // 8. Admin Login & Triage
  log(8, 'Logging in as Administrator (admin@bugarena.edu)...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@bugarena.edu',
      password: 'AdminPass123!'
    })
  });
  const adminData = await adminLoginRes.json();
  if (!adminData.token || adminData.user.role !== 'admin') fail('Admin login failed');
  const adminToken = adminData.token;
  pass(`Admin authenticated: ${adminData.user.username} (Role: ${adminData.user.role})`);

  // 9. Admin Review and Points Award
  log(9, `Admin triaging and approving report ${reportId}...`);
  const reviewRes = await fetch(`${BASE_URL}/admin/reports/${reportId}/review`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: 'approved',
      adminFeedback: 'Verified reproduction steps and confirmed comparator flaw. Full points credited.'
    })
  });
  const reviewData = await reviewRes.json();
  if (reviewRes.status !== 200 || reviewData.report.status !== 'approved') fail('Admin review failed');
  pass(`Report approved! Points awarded: +${reviewData.report.pointsAwarded} PTS`);

  // 10. Verify Cadet Score & Badges
  log(10, 'Verifying cadet points balance and milestone badges...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${cadetToken}` }
  });
  const meData = await meRes.json();
  if (meData.user.points !== 10) fail(`Points mismatch: expected 10, got ${meData.user.points}`);
  const hasFirstBlood = meData.user.badges.some(b => b.id === 'first-blood');
  if (!hasFirstBlood) fail('First Blood badge was not awarded on first solve');
  pass(`Cadet updated: ${meData.user.points} PTS, Badges: [${meData.user.badges.map(b => b.name).join(', ')}]`);

  // 11. Leaderboard Verification
  log(11, 'Checking live tournament leaderboard...');
  const leadRes = await fetch(`${BASE_URL}/leaderboard`);
  const leadData = await leadRes.json();
  const leaderEntry = leadData.leaderboard.find(p => p.username === testUser);
  if (!leaderEntry || leaderEntry.points !== 10) fail('Cadet not found with correct points on leaderboard');
  pass(`Leaderboard verified: ${testUser} holds rank #${leaderEntry.rank} with ${leaderEntry.points} PTS`);

  console.log('\n======================================================');
  console.log('🎉 ALL 11 LIVE WORKFLOW VERIFICATIONS PASSED 100%!');
  console.log('======================================================\n');
}

runE2E().catch((err) => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
