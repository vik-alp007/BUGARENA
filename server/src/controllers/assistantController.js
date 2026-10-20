import { Challenge } from '../models/Challenge.js';

// Deterministic rule-based diagnostic patterns per challenge
const DIAGNOSTIC_KNOWLEDGE = {
  'sorting-glitch': {
    category: 'Comparator Logic',
    keyConcepts: ['Lexicographical sorting', 'Numerical comparator: (a, b) => a - b', 'ASCII code point ordering'],
    diagnosticQuestions: [
      'Did you notice where 9ms sorts in comparison to 120ms?',
      'What happens when you sort ["9", "25", "120"] using JavaScript default Array.prototype.sort()?'
    ],
    guidance: 'In JavaScript, sorting without an explicit callback converts numbers to strings. "120" begins with "1", which comes before "2" and "9". To fix, compare numerically!'
  },
  'phantom-counter': {
    category: 'State Synchronization',
    keyConcepts: ['State drift', 'Derived state vs primitive state', 'Batch update mismatches'],
    diagnosticQuestions: [
      'Does the top numerical badge match the count of attendee pill tags rendered?',
      'What happens when clicking Batch Add (+5) and then removing a single element?'
    ],
    guidance: 'The counter state was decoupled from the actual items array. While items array grew by 5, the counter state only incremented by 1!'
  },
  'broken-reset': {
    category: 'Form Reset Incompleteness',
    keyConcepts: ['Partial reset', 'Hidden state variables', 'Filter re-initialization'],
    diagnosticQuestions: [
      'Did the reset function clear the search input while leaving selectedTrack active?',
      'Check the active filter badges after clicking Reset.'
    ],
    guidance: 'The reset handler only called `setSearchTerm("")` and omitted clearing `setSelectedTrack("all")` and `setMinRating(0)`.'
  },
  'validation-gap': {
    category: 'Input Validation Boundary',
    keyConcepts: ['Boundary testing', 'Negative numbers', 'Scientific notation in numeric inputs'],
    diagnosticQuestions: [
      'Did you try typing "-1" or "0" into the team size field?',
      'How does the validator handle non-empty strings that parse to invalid numbers?'
    ],
    guidance: 'The validation check only tested `if (teamSize)` instead of checking if it is an integer within [1, 4]. Negative numbers are truthy!'
  },
  'stale-state': {
    category: 'Async Closure Traps',
    keyConcepts: ['Stale closures in React', 'Functional state updater setVotes(prev => ...)', 'Concurrent event handling'],
    diagnosticQuestions: [
      'What happens when you vote for Option A and Option B within 300ms?',
      'Does the second vote overwrite the first vote when the simulated network delay finishes?'
    ],
    guidance: 'The voting dispatch references `votes` directly from the render closure rather than passing an updater function `setVotes(prev => ...)`. The delayed callback overwrites concurrent updates with old state.'
  },
  'cart-calculator': {
    category: 'Arithmetic & Order of Operations',
    keyConcepts: ['Discount order of operations', 'Sales tax computation on pre vs post discount', 'Shipping fee calculation'],
    diagnosticQuestions: [
      'Is 20% discount applied to the subtotal alone, or is shipping mistakenly added first?',
      'Is sales tax calculated on the original price or the discounted price?'
    ],
    guidance: 'The checkout logic adds the $10 shipping fee into the subtotal before applying the 20% discount, and charges tax on the full undiscounted amount.'
  },
  'lost-progress': {
    category: 'Component Lifecycle & Persistence',
    keyConcepts: ['Component unmounting on tab change', 'Ephemeral local state', 'Lifting state up'],
    diagnosticQuestions: [
      'What happens to Tab 1 notes when you click to Tab 2 and back?',
      'Where is the state stored: inside the tab subcomponent or in a parent/cache container?'
    ],
    guidance: 'When switching tabs, the active tab subcomponent unmounts, destroying its internal `useState` memory. State must be lifted to the parent or saved to a persistence store.'
  },
  'double-trigger': {
    category: 'Event Handling & Debounce',
    keyConcepts: ['Synchronous disabled state', 'Debounce / In-flight mutex', 'Double submit'],
    diagnosticQuestions: [
      'Can you click the provision button twice before the async operation begins?',
      'Does the button disable synchronously on mouseDown/click or only after state re-renders?'
    ],
    guidance: 'The button relies on an asynchronous state update to disable itself, allowing rapid double-clicks to initiate duplicate requests before the first tick completes.'
  },
  'race-condition': {
    category: 'Concurrency & Network Latency',
    keyConcepts: ['Out-of-order network responses', 'AbortController', 'Request timestamp sequencing'],
    diagnosticQuestions: [
      'If Request A (slow) starts before Request B (fast), which one finishes last?',
      'Does the final UI state reflect the query that was typed last, or the request that finished last?'
    ],
    guidance: 'Because network latency varies, the slower first request resolves after the faster second request, overwriting the newer results. Fix by using an AbortController or tracking the latest request ID.'
  },
  'broken-transition': {
    category: 'Finite State Machine Guards',
    keyConcepts: ['Invalid state transition', 'Step rollback side effects', 'Conflicting status flags'],
    diagnosticQuestions: [
      'What occurs when you step back from Step 3 to Step 2, edit a value, and step forward?',
      'Look at the state diagram: is there an unhandled transition path or deadlocked button guard?'
    ],
    guidance: 'Reverting to a previous step failed to reset the downstream guard flag `triageStatus`, resulting in an impossible compound state where both "Next" and "Back" are disabled.'
  },
  'data-mismatch': {
    category: 'Object Property Mapping',
    keyConcepts: ['Property naming discrepancy', 'Fallback default masking errors', 'CVSS calculation mapping'],
    diagnosticQuestions: [
      'Does the card show 5.3 even when Critical metrics (9.8) are selected?',
      'Compare the JSON data model keys against the JSX rendering expression keys.'
    ],
    guidance: 'The calculator outputs `{ cvssScore: ... }` but the display component looks for `item.score`. Failing to find `item.score`, it falls back to a default Medium 5.3 badge.'
  },
  'authorization-puzzle': {
    category: 'Client-Side Access Control',
    keyConcepts: ['Synthetic header manipulation', 'Client-side role enforcement', 'Trusting unverified client state'],
    diagnosticQuestions: [
      'Where does the simulated portal check for admin privileges?',
      'Can you alter the mock header `x-mock-role` in the simulation panel to unlock the admin console?'
    ],
    guidance: 'The synthetic mock portal grants access based purely on the client-side state variable `mockUserRole` without server validation. Simulating an admin role unlocks the synthetic lab admin panel.'
  }
};

export const chatWithAssistant = async (req, res, next) => {
  try {
    const { challengeId, message = '' } = req.body;

    if (!challengeId) {
      return res.status(400).json({ error: 'Challenge ID is required for diagnosis.' });
    }

    const challenge = await Challenge.findOne({ challengeId, active: true });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }

    const info = DIAGNOSTIC_KNOWLEDGE[challengeId] || {
      category: challenge.category,
      keyConcepts: ['State flow', 'User interaction', 'Edge case analysis'],
      diagnosticQuestions: ['What happens during edge-case inputs?', 'Does the UI state match the expected logic?'],
      guidance: 'Analyze the console logs in Glitch Lab and follow the step-by-step instructions.'
    };

    const queryLower = message.toLowerCase();
    let responseText = '';
    let responseType = 'general';

    if (queryLower.includes('reproduce') || queryLower.includes('how to find') || queryLower.includes('steps')) {
      responseType = 'reproduction_guide';
      responseText = `To reproduce the bug in **${challenge.title}**:\n\n1. Review the challenge instructions in Glitch Lab.\n2. Key question to test: "${info.diagnosticQuestions[0]}"\n3. Check for: ${info.keyConcepts.join(', ')}.\n4. Observe the Glitch Lab Console at the bottom for anomalies.`;
    } else if (queryLower.includes('hint') || queryLower.includes('clue') || queryLower.includes('help')) {
      responseType = 'hint_guidance';
      responseText = `**Diagnostic Insight for ${challenge.title} (${challenge.difficulty.toUpperCase()} - ${challenge.points} pts)**:\n\nFocus on **${info.category}**.\n\n${info.guidance}\n\n*Note: You can also unlock official progressive Hints 1-3 using the Challenge Details tab.*`;
    } else if (queryLower.includes('why') || queryLower.includes('cause') || queryLower.includes('explain') || queryLower.includes('logic')) {
      responseType = 'architectural_analysis';
      responseText = `**Architectural Breakdown**:\n\n- **Flaw Category**: ${info.category}\n- **Core Mechanism**: ${info.guidance}\n- **Key Diagnostic Check**: ${info.diagnosticQuestions[1] || info.diagnosticQuestions[0]}`;
    } else {
      responseType = 'assistant_reply';
      responseText = `Hello Bug Hunter! I am **GlitchAssist**, the deterministic diagnostic assistant for Bug Arena.\n\nFor **${challenge.title}** (${info.category}), consider:\n- ${info.diagnosticQuestions[0]}\n- ${info.diagnosticQuestions[1] || 'Are edge-case values properly sanitized?'}\n\nAsk me specific questions like *"How do I reproduce this?"*, *"Explain the logic flaw"*, or *"What edge case should I test?"*.`;
    }

    res.json({
      assistant: {
        name: 'GlitchAssist v2.4 (Deterministic Diagnostic Engine)',
        challengeId,
        challengeTitle: challenge.title,
        responseType,
        reply: responseText,
        keyConcepts: info.keyConcepts,
        diagnosticQuestions: info.diagnosticQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};
