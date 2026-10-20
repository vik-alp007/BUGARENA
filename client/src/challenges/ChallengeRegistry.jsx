import React from 'react';
import { SimSortingGlitch } from './sim/SimSortingGlitch.jsx';
import { SimPhantomCounter } from './sim/SimPhantomCounter.jsx';
import { SimBrokenReset } from './sim/SimBrokenReset.jsx';
import { SimValidationGap } from './sim/SimValidationGap.jsx';
import { SimStaleState } from './sim/SimStaleState.jsx';
import { SimCartCalculator } from './sim/SimCartCalculator.jsx';
import { SimLostProgress } from './sim/SimLostProgress.jsx';
import { SimDoubleTrigger } from './sim/SimDoubleTrigger.jsx';
import { SimRaceCondition } from './sim/SimRaceCondition.jsx';
import { SimBrokenTransition } from './sim/SimBrokenTransition.jsx';
import { SimDataMismatch } from './sim/SimDataMismatch.jsx';
import { SimAuthPuzzle } from './sim/SimAuthPuzzle.jsx';

export const CHALLENGE_COMPONENTS = {
  'sorting-glitch': SimSortingGlitch,
  'phantom-counter': SimPhantomCounter,
  'broken-reset': SimBrokenReset,
  'validation-gap': SimValidationGap,
  'stale-state': SimStaleState,
  'cart-calculator': SimCartCalculator,
  'lost-progress': SimLostProgress,
  'double-trigger': SimDoubleTrigger,
  'race-condition': SimRaceCondition,
  'broken-transition': SimBrokenTransition,
  'data-mismatch': SimDataMismatch,
  'authorization-puzzle': SimAuthPuzzle
};

export const getSimulationComponent = (challengeId) => {
  return CHALLENGE_COMPONENTS[challengeId] || null;
};
