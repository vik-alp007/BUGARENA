export const seededChallenges = [
  // EASY CHALLENGES (10 Points)
  {
    challengeId: 'sorting-glitch',
    order: 1,
    title: 'Sorting Glitch',
    difficulty: 'easy',
    points: 10,
    category: 'UI & Data Sorting',
    summary: 'A table of server latency metrics behaves strangely when sorted by response time.',
    description: 'The operations team noticed that their server performance dashboard does not rank nodes accurately when sorting by response latency. Low-latency servers appear behind high-latency servers in unexpected arrangements.',
    instructions: '1. Launch the Server Latency Monitor simulation in Glitch Lab.\n2. Observe the initial unordered node list.\n3. Click the "Latency (ms)" column header to sort in Ascending and Descending order.\n4. Examine nodes with 1-digit, 2-digit, and 3-digit values (e.g., 9ms, 25ms, 120ms).\n5. Identify the exact sorting comparator discrepancy and submit a bug report with clear steps.',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'Pay close attention to where 9ms and 120ms end up relative to 25ms when sorting ascending.'
      },
      {
        tier: 2,
        title: 'Comparator Type',
        text: 'Look at how JavaScript sorts arrays by default without an explicit numerical comparison function.'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'The table applies lexicographical string comparison (e.g., "120" < "25" < "9") instead of numeric parsing (a - b).'
      }
    ],
    tags: ['sorting', 'javascript', 'lexicographical', 'table', 'comparator']
  },
  {
    challengeId: 'phantom-counter',
    order: 2,
    title: 'Phantom Counter',
    difficulty: 'easy',
    points: 10,
    category: 'State Management',
    summary: 'The event badge quota selector displays counts that drift from the internal reservation balance.',
    description: 'During ticket reservation for BugCon 2026, students reported that clicking quick-increment and decrement buttons caused the available seats counter to jump erratically or skip numbers.',
    instructions: '1. Launch the Badge Quota Allocator in Glitch Lab.\n2. Click "Add Attendee" twice, then click "Batch Add (+5)".\n3. Observe the displayed attendee counter versus the individual attendee card tally.\n4. Try removing an attendee while batch mode is toggled on.\n5. Note the synchronization drift between the UI counter and the true list length.',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'Compare the big number badge at the top with the actual number of attendee tags rendered in the panel below.'
      },
      {
        tier: 2,
        title: 'State Mutation',
        text: 'Notice if the counter relies on a separate primitive count state variable instead of deriving directly from the array length.'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'When batch adding or removing specific entries, the count state updates by a hardcoded delta (+1) instead of the actual array modification (+5 or item index splice).'
      }
    ],
    tags: ['react', 'state-drift', 'counter', 'derived-state']
  },
  {
    challengeId: 'broken-reset',
    order: 3,
    title: 'Broken Reset',
    difficulty: 'easy',
    points: 10,
    category: 'State Management',
    summary: 'Clicking the "Reset Form & Filters" button only clears surface inputs, retaining hidden filter state.',
    description: 'A cybersecurity event filter allows attendees to filter sessions by track, difficulty level, and speaker availability. Users complain that after pressing "Reset All", subsequent searches still apply previously selected hidden filters.',
    instructions: '1. In Glitch Lab, open the Session Filter simulation.\n2. Select "Hardware Hacking" track and set "Min Rating" to 4.5 Stars.\n3. Verify the filtered session list updates to show matched sessions.\n4. Click "Reset All Filters".\n5. Check whether the rating slider or internal active category restored to its default state.',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'Look at the "Active Filters" pill count badge after pressing Reset All.'
      },
      {
        tier: 2,
        title: 'Reset Handler Scope',
        text: 'Check if the reset function reinitializes all state hooks or only resets the search keyword string.'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'The reset handler clears the search query text input, but leaves the `selectedTrack` and `minRating` filter parameters intact.'
      }
    ],
    tags: ['reset', 'filters', 'form-state', 'clean-state']
  },
  {
    challengeId: 'validation-gap',
    order: 4,
    title: 'Validation Gap',
    difficulty: 'easy',
    points: 10,
    category: 'Validation & Input',
    summary: 'A team registration form accepts invalid team size inputs and negative or non-integer values.',
    description: 'The college hackathon registration portal restricts team sizes to between 1 and 4 members. However, unexpected edge-case inputs can bypass client-side checks and create abnormal team allocations.',
    instructions: '1. Launch the Team Registration Portal in Glitch Lab.\n2. Try entering negative values (e.g., -1, -5), zero (0), or floating decimals (e.g., 2.5).\n3. Test alphanumeric values like "3e2" or pasting text into the numerical field.\n4. Click "Register Team" and observe the submitted payload alert and team card.\n5. Document which invalid format slips past the validation check.',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'Try typing a minus sign or exponential notation into the number field and clicking submit.'
      },
      {
        tier: 2,
        title: 'Input Type & Boundaries',
        text: 'Observe if the submission validator only checks `teamSize !== ""` rather than enforcing `Number.isInteger(val) && val >= 1 && val <= 4`.'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'Negative integers and scientific notation values (e.g. -2, 0, or empty space after backspacing) pass because validation checks truthiness instead of a positive range constraint.'
      }
    ],
    tags: ['validation', 'boundary-testing', 'input-sanitization', 'edge-case']
  },

  // MEDIUM CHALLENGES (25 Points)
  {
    challengeId: 'stale-state',
    order: 5,
    title: 'Stale State',
    difficulty: 'medium',
    points: 25,
    category: 'State Management',
    summary: 'An interactive voting widget exhibits stale closure behavior when votes are submitted in quick succession.',
    description: 'During a live keynote voting poll, attendees voting on different topics found that their rapid clicks on multiple poll options resulted in prior votes overwriting subsequent votes or reverting to old counts.',
    instructions: '1. Open the Keynote Topic Voting simulation.\n2. Click "Vote A" once, then immediately click "Vote B" within 500ms.\n3. Wait for the asynchronous confirmation banner to settle.\n4. Check the totals for both Topic A and Topic B.\n5. Observe how an asynchronous callback captures a stale state reference and rolls back recent updates.',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'Rapidly clicking different vote buttons causes one vote to disappear when the other resolves.'
      },
      {
        tier: 2,
        title: 'Closure Trap',
        text: 'Inspect the setTimeout/async handler in the vote dispatch. Is it referencing `pollVotes` directly rather than functional updater `setVotes(prev => ...)`?'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'The voting dispatch reads state from a stale closure inside a delayed network simulator, overwriting concurrent state transitions.'
      }
    ],
    tags: ['react', 'stale-closure', 'async-state', 'functional-updater']
  },
  {
    challengeId: 'cart-calculator',
    order: 6,
    title: 'Cart Calculator',
    difficulty: 'medium',
    points: 25,
    category: 'Calculation Logic',
    summary: 'The Hackathon Swag Store calculates coupon discounts and student sales tax with an off-by-one or order-of-operations bug.',
    description: 'Participants buying branded hardware kits and hoodies noticed the final invoice total does not add up correctly when promo code "BUG20" (20% off) is applied alongside shipping fees.',
    instructions: '1. Launch the Swag Checkout simulation in Glitch Lab.\n2. Add the "Cyberpunk Hoodie ($50)" and "Hardware Debugger Kit ($30)" to the cart (Subtotal: $80).\n3. Apply coupon code "BUG20".\n4. Observe the Discount, Tax (10%), Shipping ($10), and Final Total.\n5. Calculate the mathematically correct total and identify where the formula diverges.',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'Calculate: Should discount be applied before or after shipping? And is the tax being levied on the shipping cost or the pre-discount total?'
      },
      {
        tier: 2,
        title: 'Formula Inspection',
        text: 'Check if the coupon discount is subtracting a flat rate or multiplying the tax against the unreduced subtotal.'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'The checkout logic calculates tax based on the undiscounted subtotal AND adds the shipping fee before computing the 20% discount, giving an incorrect final sum.'
      }
    ],
    tags: ['math-logic', 'finance', 'discount', 'order-of-operations']
  },
  {
    challengeId: 'lost-progress',
    order: 7,
    title: 'Lost Progress',
    difficulty: 'medium',
    points: 25,
    category: 'Data Integrity',
    summary: 'A simulated multi-step challenge checklist loses intermediate answers when switching between tabs.',
    description: 'The simulated lab notebook allows contestants to write findings across three experiment tabs. Switching between Tab 1, Tab 2, and Tab 3 causes unsaved drafts to vanish or get overwritten by placeholder data.',
    instructions: '1. Open the Multi-Stage Lab Notebook in Glitch Lab.\n2. In Tab 1 ("Reconnaissance"), enter your notes and toggle checkboxes.\n3. Switch to Tab 2 ("Vulnerability Analysis") and enter analysis notes.\n4. Switch back to Tab 1.\n5. Inspect whether your typed Reconnaissance notes and checkbox states persisted or were wiped.',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'Check if each tab maintains its own local state or if tab switching unmounts the component without lifting state up.'
      },
      {
        tier: 2,
        title: 'Storage & Key Mismatch',
        text: 'Observe if the active tab component reinitializes its default state every time it renders.'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'The active tab component conditionally unmounts when the tab changes, and state is stored in ephemeral child component hooks instead of parent state or memory cache.'
      }
    ],
    tags: ['unmount', 'state-persistence', 'tabs', 'data-loss']
  },
  {
    challengeId: 'double-trigger',
    order: 8,
    title: 'Double Trigger',
    difficulty: 'medium',
    points: 25,
    category: 'Event Handling',
    summary: 'A simulated resource provisioning button lacks debounce or re-entry lock, firing duplicate API requests.',
    description: 'When provisioning a cloud sandbox instance for bug testing, users double-clicking the "Provision Instance" button end up creating duplicate billing entries and twin server instances.',
    instructions: '1. Open the Cloud Sandbox Provisioner in Glitch Lab.\n2. Click "Provision Sandbox" twice quickly (or double-click).\n3. Monitor the simulated network activity log and active instance table.\n4. Observe whether two identical servers are spun up with identical credentials.\n5. Verify that the button fails to disable immediately upon the first click.',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'Watch the simulated network monitor at the bottom of the simulation while double clicking.'
      },
      {
        tier: 2,
        title: 'Debounce / In-Flight Guard',
        text: 'Notice whether `isSubmitting` flag is set synchronously before the async mock promise starts, or after a delay.'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'The provisioning button does not set its `disabled` attribute until after the first async tick completes, allowing rapid multi-clicks to trigger multiple distinct provisioning calls.'
      }
    ],
    tags: ['double-submit', 'debounce', 'race-condition', 'event-handling']
  },

  // HARD CHALLENGES (50 Points)
  {
    challengeId: 'race-condition',
    order: 9,
    title: 'Race Condition',
    difficulty: 'hard',
    points: 50,
    category: 'Async & Concurrency',
    summary: 'Asynchronous search suggestions resolve out of order, rendering outdated query results over newer searches.',
    description: 'In the Global Threat Intelligence search bar, typing quickly (e.g. searching "Malware" then switching to "Phishing") results in the slow "Malware" request resolving AFTER the fast "Phishing" request, leaving the screen showing results for the wrong search term.',
    instructions: '1. Open the Threat Intelligence Search simulation.\n2. Notice the simulated network delay controls (Fast vs Slow API).\n3. Type "Ransomware", then immediately clear and type "Botnet".\n4. Watch the simulated API response stream in the telemetry log.\n5. Observe how the final displayed result list displays findings for "Ransomware" even though the input box says "Botnet".',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'Observe the query string in the search input compared to the header of the results table once all pending requests settle.'
      },
      {
        tier: 2,
        title: 'Async Ordering',
        text: 'A slower request started at t=0 can resolve after a faster request started at t=100ms. Look for missing cancellation tokens or query ID matching.'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'The search component does not use an AbortController or ignore outdated response timestamps, allowing an older high-latency response to overwrite the newest response.'
      }
    ],
    tags: ['race-condition', 'async', 'concurrency', 'out-of-order', 'abort-controller']
  },
  {
    challengeId: 'broken-transition',
    order: 10,
    title: 'Broken Transition',
    difficulty: 'hard',
    points: 50,
    category: 'State Machines',
    summary: 'A multi-step vulnerability disclosure workflow gets trapped in an impossible state when stepping backward.',
    description: 'A 4-step Responsible Disclosure wizard tracks report lifecycle: Draft -> Verification -> Triage -> Publication. Clicking the "Back" button from Step 3 under specific conditions corrupts the state machine, causing buttons to lock and skipping required verification steps.',
    instructions: '1. Launch the Disclosure State Machine simulation.\n2. Progress from "Draft" -> "Verification" -> "Triage".\n3. Click "Edit Details" (Back to Step 2), toggle the "High Severity" flag.\n4. Click "Next: Triage" again.\n5. Notice how the wizard enters an invalid transition state where both "Submit to Vendor" and "Re-verify" are disabled or conflicting states are active simultaneously.',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'Check the State Inspector diagram on the right. Does the active step indicator highlight two states or NaN?'
      },
      {
        tier: 2,
        title: 'State Transition Logic',
        text: 'Look at the step indexing logic: does the "Back" action decrement an index without clearing the conditional sub-state?'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'When moving backward from Triage, the state variable `step` is set to 2, but `triagePayload` remains locked as `in_review`, which triggers an impossible combination in the transition guard.'
      }
    ],
    tags: ['state-machine', 'workflow', 'finite-state', 'navigation-bug']
  },
  {
    challengeId: 'data-mismatch',
    order: 11,
    title: 'Data Mismatch',
    difficulty: 'hard',
    points: 50,
    category: 'Data Integrity',
    summary: 'The vulnerability CVSS score card displays metric calculations that disagree with the underlying vulnerability record.',
    description: 'A cybersecurity audit tool displays an interactive CVSS v3.1 calculator card. While the individual vectors (Attack Vector: Network, Attack Complexity: Low, Privileges Required: None) should result in a Critical 9.8 score, the summary card displays Medium 5.3 due to an internal object mapping failure.',
    instructions: '1. Launch the CVSS Metric Analyzer in Glitch Lab.\n2. Configure the simulated vulnerability metrics to: AV: Network, AC: Low, PR: None, UI: None, Scope: Unchanged, Confidentiality: High, Integrity: High, Availability: High.\n3. Compare the calculated vector string with the displayed Score badge and severity description.\n4. Inspect the underlying synthetic JSON payload viewer.\n5. Pinpoint why the displayed score maps to an incorrect property or default fallback.',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'Compare the JSON data view on the right panel with the visual cards on the left panel.'
      },
      {
        tier: 2,
        title: 'Object Key Typo / Mapping',
        text: 'Look at the property names used in the calculator helper: e.g. `baseScore` vs `base_score` or `impact` vs `baseImpact`.'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'The display card references `vulnData.score` while the calculator engine outputs `{ cvssScore: ... }`, causing the UI to fall back to a hardcoded default metric of 5.3.'
      }
    ],
    tags: ['cvss', 'data-mapping', 'object-keys', 'data-integrity']
  },
  {
    challengeId: 'authorization-puzzle',
    order: 12,
    title: 'Authorization Puzzle',
    difficulty: 'hard',
    points: 50,
    category: 'Access Control',
    summary: 'An isolated synthetic admin console simulation contains an insecure client-side role override flaw.',
    description: 'A completely isolated, synthetic student portal simulation has a mock admin panel. By examining the simulated browser storage inspector and client-side session dispatcher in this sandboxed mock app, participants can discover a simulated privilege flaw.',
    instructions: '1. Launch the Synthetic Mock Portal simulation in Glitch Lab.\n2. Notice that you are logged into the mock portal as a standard "Student Observer".\n3. Open the "Synthetic Storage & Mock Headers" panel built into the simulation.\n4. Observe how the mock client checks permission: does it validate simulated signatures, or does it parse an unverified mock cookie/header `x-mock-role`?\n5. Test altering the mock role in the simulation tools to "Auditor" or "LabAdmin" and observe the synthetic admin flag unlock.',
    hints: [
      {
        tier: 1,
        title: 'Observational Cue',
        text: 'This is an isolated synthetic simulation inside Glitch Lab with mock storage tools. Look at the "Simulated Session Context" tab.'
      },
      {
        tier: 2,
        title: 'Client-Side Role Trust',
        text: 'Notice that the simulation determines access by reading a client-controlled state variable `mockUserRole` without server confirmation.'
      },
      {
        tier: 3,
        title: 'Reproduction Guide',
        text: 'In the synthetic simulation controls, toggling the client-side header `X-Synthetic-Role: admin` causes the mock UI to grant access to simulated private flags without verifying the synthetic token.'
      }
    ],
    tags: ['access-control', 'synthetic-auth', 'client-side-logic', 'security-flaw']
  }
];
