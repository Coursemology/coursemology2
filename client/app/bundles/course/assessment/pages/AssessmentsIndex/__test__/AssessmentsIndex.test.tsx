import { render } from 'test-utils';
import { AssessmentsListData } from 'types/course/assessment/assessments';

import { fetchAssessments } from '../../../operations/assessments';
import AssessmentsIndex from '../index';

jest.mock('../../../operations/assessments', () => ({
  fetchAssessments: jest.fn(),
}));

const mockFetchAssessments = fetchAssessments as jest.MockedFunction<
  typeof fetchAssessments
>;

const listData = (
  canCreateAssessments: boolean,
  canImportAssessments: boolean,
): AssessmentsListData => ({
  display: {
    isStudent: false,
    isGamified: false,
    isKoditsuExamEnabled: false,
    timelineAlgorithm: 'fixed',
    allowRandomization: false,
    isAchievementsEnabled: false,
    isMonitoringEnabled: false,
    bonusAttributes: false,
    endTimes: false,
    canCreateAssessments,
    canImportAssessments,
    tabId: 42,
    tabTitle: 'Assessments: Default',
    tabUrl: '/courses/1/assessments',
    canManageMonitor: false,
    isMarketplaceContainer: false,
    category: {
      id: 1,
      title: 'Assessments',
      tabs: [{ id: 42, title: 'Default' }],
    },
  },
  assessments: [],
});

const renderIndex = (
  canCreateAssessments: boolean,
  canImportAssessments: boolean,
): ReturnType<typeof render> => {
  mockFetchAssessments.mockResolvedValue(
    listData(canCreateAssessments, canImportAssessments),
  );

  return render(<AssessmentsIndex />);
};

// The import button only links into the marketplace, whose access is allow-listed per person.
// Riding it on `canCreateAssessments` showed every manager a button that only led to a 403.
it('hides the import button from a user who cannot reach the marketplace', async () => {
  const page = renderIndex(true, false);

  expect(
    await page.findByRole('button', { name: 'New Assessment' }),
  ).toBeVisible();
  expect(
    page.queryByRole('link', { name: 'Import Assessments' }),
  ).not.toBeInTheDocument();
});

it('shows the import button to a user who can reach the marketplace', async () => {
  const page = renderIndex(true, true);

  expect(
    await page.findByRole('link', { name: 'Import Assessments' }),
  ).toBeVisible();
});

it('shows the import button alone when the user cannot create assessments', async () => {
  const page = renderIndex(false, true);

  expect(
    await page.findByRole('link', { name: 'Import Assessments' }),
  ).toBeVisible();
  expect(
    page.queryByRole('button', { name: 'New Assessment' }),
  ).not.toBeInTheDocument();
});
