import { render, screen } from 'test-utils';

import ConfigureWeightsContent from '../components/ConfigureWeightsContent';

// Render synchronously without the real provider's locale-loading spinner
// (uses the manual mock at lib/components/wrappers/__mocks__/I18nProvider).
jest.mock('lib/components/wrappers/I18nProvider');

const props = {
  categories: [],
  tabs: [],
  assessments: [],
  gamificationEnabled: false,
  courseMaxLevel: 0,
  levelContribution: {
    enabled: false,
    weight: 0,
    formula: '',
    show: false,
    clamp: true,
  },
  capTotal: false,
  students: [],
  onSaved: jest.fn(),
  registerSave: jest.fn(),
};

const state = {
  gradebook: {
    categories: [],
    tabs: [],
    assessments: [],
    students: [],
    submissions: [],
    gamificationEnabled: false,
    weightedViewEnabled: false,
    canManageWeights: true,
    courseMaxLevel: 0,
    capTotal: false,
    levelContribution: {
      enabled: false,
      formula: '',
      weight: 0,
      show: false,
      clamp: true,
    },
  },
};

test('renders weight configuration body and registers a save handler', () => {
  render(<ConfigureWeightsContent {...props} />, { state });
  // Host can wire its footer to the body's save handler.
  expect(props.registerSave).toHaveBeenCalled();
  // The total row from the body is present.
  expect(screen.getByText(/^Total: \d/i)).toBeInTheDocument();
});
