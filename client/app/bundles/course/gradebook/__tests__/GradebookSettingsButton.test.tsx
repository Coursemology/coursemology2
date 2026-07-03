import userEvent from '@testing-library/user-event';
import { render, screen } from 'test-utils';

import GradebookSettingsButton from '../components/manage/GradebookSettingsButton';

jest.mock('../operations', () => ({
  __esModule: true,
  ...jest.requireActual('../operations'),
  reorderExternalAssessments: jest.fn(
    () => (): Promise<void> => Promise.resolve(),
  ),
}));

const props = {
  weightedViewEnabled: false,
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

it('opens the settings dialog on click', async () => {
  render(<GradebookSettingsButton {...props} />, { state });
  await userEvent.click(
    await screen.findByRole('button', { name: /gradebook settings/i }),
  );
  expect(await screen.findByRole('dialog')).toBeVisible();
});

it('does not open the settings dialog by default', () => {
  render(<GradebookSettingsButton {...props} />, { state });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
