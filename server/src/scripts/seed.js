import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Challenge } from '../models/Challenge.js';
import { BugReport } from '../models/BugReport.js';
import { ChallengeProgress } from '../models/ChallengeProgress.js';
import { AuditLog } from '../models/AuditLog.js';
import { seededChallenges } from '../data/seedChallenges.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Starting BUG ARENA database population...');
    await connectDB();

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Challenge.deleteMany({}),
      BugReport.deleteMany({}),
      ChallengeProgress.deleteMany({}),
      AuditLog.deleteMany({})
    ]);
    console.log('[Seed] Cleared existing collections.');

    // 1. Seed 12 Challenges
    const createdChallenges = await Challenge.insertMany(seededChallenges);
    console.log(`[Seed] Seeded ${createdChallenges.length} challenges successfully.`);

    const challengeMap = {};
    createdChallenges.forEach(c => {
      challengeMap[c.challengeId] = c;
    });

    // 2. Seed Users
    // Admin User
    const adminUser = new User({
      username: 'admin_root',
      email: 'admin@bugarena.edu',
      password: 'AdminPass123!',
      role: 'admin',
      college: 'Cyber Defense Institute',
      bio: 'Bug Arena Competition Lead & Security Architect',
      points: 0,
      badges: [
        {
          id: 'admin-key',
          name: 'Arena Overseer',
          icon: 'Shield',
          description: 'Platform Administrator & Evaluation Lead'
        }
      ]
    });
    await adminUser.save();

    // Participant 1: neon_hunter (Solved sorting-glitch, stale-state, race-condition)
    const neonHunter = new User({
      username: 'neon_hunter',
      email: 'neon_hunter@stanford.edu',
      password: 'CadetPass123!',
      role: 'participant',
      college: 'Stanford Cyber Defense',
      bio: 'Reverse engineering, race conditions, and frontend vulnerabilities.',
      points: 85, // 10 (sorting) + 25 (stale) + 50 (race)
      solvedChallenges: [
        challengeMap['sorting-glitch']._id,
        challengeMap['stale-state']._id,
        challengeMap['race-condition']._id
      ],
      badges: [
        {
          id: 'cadet-registered',
          name: 'Bug Arena Cadet',
          icon: 'Shield',
          description: 'Enlisted in the Bug Arena cybersecurity competition'
        },
        {
          id: 'first-blood',
          name: 'First Blood',
          icon: 'Flame',
          description: 'Submitted your first verified, accepted bug report!'
        },
        {
          id: 'bug-hunter',
          name: 'Bug Hunter',
          icon: 'Target',
          description: 'Successfully uncovered and reported 3 distinct vulnerabilities'
        },
        {
          id: 'elite-sleuth',
          name: 'Elite Sleuth',
          icon: 'Cpu',
          description: 'Cracked a Hard tier challenge (Race Condition, State Transition, or Auth Puzzle)'
        }
      ]
    });
    await neonHunter.save();

    // Participant 2: hacker_zero (Solved phantom-counter, cart-calculator)
    const hackerZero = new User({
      username: 'hacker_zero',
      email: 'hacker_zero@mit.edu',
      password: 'CadetPass123!',
      role: 'participant',
      college: 'MIT Security Lab',
      bio: 'Hunting logic flaws, state desync, and calculation bugs.',
      points: 35, // 10 (phantom) + 25 (cart)
      solvedChallenges: [
        challengeMap['phantom-counter']._id,
        challengeMap['cart-calculator']._id
      ],
      badges: [
        {
          id: 'cadet-registered',
          name: 'Bug Arena Cadet',
          icon: 'Shield',
          description: 'Enlisted in the Bug Arena cybersecurity competition'
        },
        {
          id: 'first-blood',
          name: 'First Blood',
          icon: 'Flame',
          description: 'Submitted your first verified, accepted bug report!'
        }
      ]
    });
    await hackerZero.save();

    // Participant 3: cipher_cadet (Fresh registered user with 1 pending report)
    const cipherCadet = new User({
      username: 'cipher_cadet',
      email: 'cipher_cadet@berkeley.edu',
      password: 'CadetPass123!',
      role: 'participant',
      college: 'UC Berkeley EECS',
      bio: 'EECS undergrad focusing on UI state anomalies.',
      points: 0,
      solvedChallenges: [],
      badges: [
        {
          id: 'cadet-registered',
          name: 'Bug Arena Cadet',
          icon: 'Shield',
          description: 'Enlisted in the Bug Arena cybersecurity competition'
        }
      ]
    });
    await cipherCadet.save();

    console.log('[Seed] Seeded Admin and 3 Participants.');

    // 3. Seed Bug Reports
    // Neon Hunter's approved reports
    const report1 = await BugReport.create({
      user: neonHunter._id,
      challenge: challengeMap['sorting-glitch']._id,
      challengeId: 'sorting-glitch',
      title: 'String-based lexicographical comparator used on latency values',
      category: 'UI & Data Sorting',
      severity: 'medium',
      reproductionSteps: '1. Launch Latency Monitor.\n2. Click Latency column header to sort ascending.\n3. Observe 120ms placed ahead of 25ms and 9ms due to "1" < "2" < "9".',
      expectedResult: '9ms should appear first, followed by 25ms, followed by 120ms.',
      actualResult: 'Values are compared as UTF-16 character strings instead of numbers.',
      evidenceText: 'Array.prototype.sort() invoked without custom numeric comparator (a, b) => a.latency - b.latency',
      status: 'approved',
      adminFeedback: 'Excellent root-cause breakdown. Verified and points awarded.',
      reviewedBy: adminUser._id,
      reviewedAt: new Date(Date.now() - 3600000 * 24),
      pointsAwarded: 10
    });

    const report2 = await BugReport.create({
      user: neonHunter._id,
      challenge: challengeMap['race-condition']._id,
      challengeId: 'race-condition',
      title: 'Missing AbortController causes slow query to overwrite newer query',
      category: 'Async & Concurrency',
      severity: 'high',
      reproductionSteps: '1. Enter "Ransomware" in search box.\n2. Immediately erase and type "Botnet".\n3. Wait 1.5 seconds.\n4. Screen updates to show "Ransomware" payload.',
      expectedResult: 'Search results must correspond to the currently active input query "Botnet".',
      actualResult: 'First request resolves at t=1400ms and overwrites the second request which completed at t=400ms.',
      evidenceText: 'Network trace proves inverted response resolution sequence without timestamp guard.',
      status: 'approved',
      adminFeedback: 'Clear async trace and concise reproduction. Hard points credited.',
      reviewedBy: adminUser._id,
      reviewedAt: new Date(Date.now() - 3600000 * 12),
      pointsAwarded: 50
    });

    // Hacker Zero's approved and pending reports
    const report3 = await BugReport.create({
      user: hackerZero._id,
      challenge: challengeMap['phantom-counter']._id,
      challengeId: 'phantom-counter',
      title: 'Attendee counter increments by 1 on batch add of 5 elements',
      category: 'State Management',
      severity: 'medium',
      reproductionSteps: '1. Click Batch Add (+5).\n2. Count rendered attendees (total 5).\n3. View counter header (reads 1).',
      expectedResult: 'Counter should reflect 5 attendees.',
      actualResult: 'Display shows 1 while array has 5 items.',
      evidenceText: 'State variable decoupled from attendeeList.length.',
      status: 'approved',
      adminFeedback: 'Confirmed. Great discovery of decoupled state drift.',
      reviewedBy: adminUser._id,
      reviewedAt: new Date(Date.now() - 3600000 * 8),
      pointsAwarded: 10
    });

    // Cipher Cadet's pending report for broken-reset
    const report4 = await BugReport.create({
      user: cipherCadet._id,
      challenge: challengeMap['broken-reset']._id,
      challengeId: 'broken-reset',
      title: 'Reset button does not clear selectedTrack filter state',
      category: 'State Management',
      severity: 'low',
      reproductionSteps: '1. Select "Hardware Hacking" track.\n2. Click "Reset All".\n3. Search keyword returns 0 results because track filter remains active behind the scenes.',
      expectedResult: 'Reset should set selectedTrack back to "all".',
      actualResult: 'Selected track is untouched by reset handler.',
      evidenceText: 'Inspected active filter badge count showing 1 active filter after reset.',
      status: 'pending'
    });

    // Hacker Zero's changes requested report
    const report5 = await BugReport.create({
      user: hackerZero._id,
      challenge: challengeMap['validation-gap']._id,
      challengeId: 'validation-gap',
      title: 'Negative numbers accepted in team registration',
      category: 'Validation & Input',
      severity: 'medium',
      reproductionSteps: 'Entered -1 into team size input and pressed register button.',
      expectedResult: 'Error message indicating team size must be between 1 and 4.',
      actualResult: 'Form was accepted without validation error or rejection.',
      evidenceText: 'Payload sent { teamSize: -1 } with 200 OK simulated response.',
      status: 'changes_requested',
      adminFeedback: 'Please provide detailed step-by-step reproduction instructions and specify the submitted payload.',
      reviewedBy: adminUser._id,
      reviewedAt: new Date(Date.now() - 3600000 * 4)
    });

    console.log('[Seed] Seeded 5 initial bug reports across all statuses.');

    // 4. Seed Challenge Progress
    await ChallengeProgress.create([
      {
        user: neonHunter._id,
        challenge: challengeMap['sorting-glitch']._id,
        challengeId: 'sorting-glitch',
        status: 'solved',
        unlockedHints: [1],
        simulationsRun: 3,
        solvedAt: new Date(Date.now() - 3600000 * 24)
      },
      {
        user: neonHunter._id,
        challenge: challengeMap['race-condition']._id,
        challengeId: 'race-condition',
        status: 'solved',
        unlockedHints: [1, 2],
        simulationsRun: 6,
        solvedAt: new Date(Date.now() - 3600000 * 12)
      },
      {
        user: hackerZero._id,
        challenge: challengeMap['phantom-counter']._id,
        challengeId: 'phantom-counter',
        status: 'solved',
        unlockedHints: [],
        simulationsRun: 4,
        solvedAt: new Date(Date.now() - 3600000 * 8)
      },
      {
        user: cipherCadet._id,
        challenge: challengeMap['broken-reset']._id,
        challengeId: 'broken-reset',
        status: 'attempted',
        unlockedHints: [1],
        simulationsRun: 2
      }
    ]);

    // 5. Seed Audit Logs
    await AuditLog.create([
      {
        actor: adminUser._id,
        action: 'REPORT_APPROVED',
        targetType: 'BugReport',
        targetId: report1._id.toString(),
        metadata: { pointsAwarded: 10, challengeId: 'sorting-glitch' }
      },
      {
        actor: adminUser._id,
        action: 'REPORT_APPROVED',
        targetType: 'BugReport',
        targetId: report2._id.toString(),
        metadata: { pointsAwarded: 50, challengeId: 'race-condition' }
      },
      {
        actor: adminUser._id,
        action: 'REPORT_APPROVED',
        targetType: 'BugReport',
        targetId: report3._id.toString(),
        metadata: { pointsAwarded: 10, challengeId: 'phantom-counter' }
      }
    ]);

    console.log('\n================================================================');
    console.log('✅ BUG ARENA Database successfully seeded with demo competition data!');
    console.log('----------------------------------------------------------------');
    console.log('Admin Account:        admin@bugarena.edu / AdminPass123!');
    console.log('Participant 1:        neon_hunter@stanford.edu / CadetPass123!');
    console.log('Participant 2:        hacker_zero@mit.edu / CadetPass123!');
    console.log('Participant 3:        cipher_cadet@berkeley.edu / CadetPass123!');
    console.log('================================================================\n');

    return true;
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      await disconnectDB();
      process.exit(1);
    });
}
