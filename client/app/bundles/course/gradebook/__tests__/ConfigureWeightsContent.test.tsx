import userEvent from '@testing-library/user-event';
import { render, screen } from 'test-utils';

import ConfigureWeightsContent from '../components/ConfigureWeightsContent';
import { updateGradebookWeights } from '../operations';

// Render synchronously without the real provider's locale-loading spinner
// (uses the manual mock at lib/components/wrappers/__mocks__/I18nProvider).
jest.mock('lib/components/wrappers/I18nProvider');

jest.mock('../operations', () => ({
  __esModule: true,
  ...jest.requireActual('../operations'),
  updateGradebookWeights: jest.fn(() => (): Promise<void> => Promise.resolve()),
}));

const baseProps = {
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

const mockedUpdate = updateGradebookWeights as jest.MockedFunction<
  typeof updateGradebookWeights
>;

// The host wires its footer Save button to the body via registerSave(fn, canSave).
// Grab the latest handler and invoke it to exercise the save path.
const triggerSave = async (registerSave: jest.Mock): Promise<void> => {
  const calls = registerSave.mock.calls;
  const handleSave = calls[calls.length - 1][0] as () => Promise<void>;
  await handleSave();
};

beforeEach(() => {
  mockedUpdate.mockClear();
});

test('renders weight configuration body and registers a save handler', () => {
  const registerSave = jest.fn();
  render(
    <ConfigureWeightsContent {...baseProps} registerSave={registerSave} />,
    {
      state,
    },
  );
  // Host can wire its footer to the body's save handler.
  expect(registerSave).toHaveBeenCalled();
  // The total row from the body is present.
  expect(screen.getByText(/^Total: \d/i)).toBeInTheDocument();
});

test('omits levelContribution from the save when it was never enabled', async () => {
  const registerSave = jest.fn();
  render(
    <ConfigureWeightsContent
      {...baseProps}
      gamificationEnabled
      registerSave={registerSave}
    />,
    { state },
  );

  await triggerSave(registerSave);

  expect(mockedUpdate).toHaveBeenCalledTimes(1);
  expect(mockedUpdate.mock.calls[0][1]).toBeUndefined();
});

test('sends levelContribution when the feature is enabled', async () => {
  const registerSave = jest.fn();
  render(
    <ConfigureWeightsContent
      {...baseProps}
      gamificationEnabled
      levelContribution={{ ...baseProps.levelContribution, enabled: true }}
      registerSave={registerSave}
    />,
    { state },
  );

  await triggerSave(registerSave);

  expect(mockedUpdate).toHaveBeenCalledTimes(1);
  expect(mockedUpdate.mock.calls[0][1]).toEqual(
    expect.objectContaining({ enabled: true }),
  );
});

test('still sends levelContribution when disabling a previously enabled config', async () => {
  const registerSave = jest.fn();
  render(
    <ConfigureWeightsContent
      {...baseProps}
      gamificationEnabled
      levelContribution={{ ...baseProps.levelContribution, enabled: true }}
      registerSave={registerSave}
    />,
    { state },
  );

  // Turn the feature off, then save: the backend must receive enabled:false so
  // the persisted config is actually disabled rather than left untouched.
  await userEvent.click(
    screen.getByRole('checkbox', { name: 'Level contribution' }),
  );
  await triggerSave(registerSave);

  expect(mockedUpdate).toHaveBeenCalledTimes(1);
  expect(mockedUpdate.mock.calls[0][1]).toEqual(
    expect.objectContaining({ enabled: false }),
  );
});
