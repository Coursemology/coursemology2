import { render, screen } from 'test-utils';

import GradebookSettingsDialog from '../components/manage/GradebookSettingsDialog';

// Render synchronously without the real provider's locale-loading spinner
// (uses the manual mock at lib/components/wrappers/__mocks__/I18nProvider).
jest.mock('lib/components/wrappers/I18nProvider');

jest.mock('../operations', () => ({
  __esModule: true,
  ...jest.requireActual('../operations'),
  reorderExternalAssessments: jest.fn(
    () => (): Promise<void> => Promise.resolve(),
  ),
}));

const weightsProps = {
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
  } as any,
  capTotal: false,
  students: [],
};

const stateWith = (weightedViewEnabled: boolean) => ({
  gradebook: {
    categories: [],
    tabs: [],
    assessments: [],
    students: [],
    submissions: [],
    gamificationEnabled: false,
    weightedViewEnabled,
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
});

test('weighted: shows Weights and External assessments tabs, Weights first', () => {
  render(
    <GradebookSettingsDialog
      onClose={jest.fn()}
      open
      weightedViewEnabled
      {...weightsProps}
    />,
    { state: stateWith(true) },
  );
  expect(screen.getByRole('tab', { name: /weights/i })).toBeInTheDocument();
  expect(
    screen.getByRole('tab', { name: /external assessments/i }),
  ).toBeInTheDocument();
});

test('non-weighted: no tab strip, renders external assessments directly', () => {
  render(
    <GradebookSettingsDialog
      onClose={jest.fn()}
      open
      weightedViewEnabled={false}
      {...weightsProps}
    />,
    { state: stateWith(false) },
  );
  expect(screen.queryByRole('tab')).toBeNull();
});
