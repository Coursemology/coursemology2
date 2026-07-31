import { render, screen } from 'test-utils';
import { AssessmentListData } from 'types/course/assessment/assessments';

import StatusBadges from '../StatusBadges';

const assessment = (
  overrides: Partial<AssessmentListData> = {},
): AssessmentListData => ({
  id: 1,
  title: 'Recursion',
  status: 'open',
  actionButtonUrl: null,
  passwordProtected: false,
  published: true,
  autograded: false,
  hasPersonalTimes: false,
  affectsPersonalTimes: false,
  url: '/courses/1/assessments/1',
  conditionSatisfied: true,
  startAt: { isFixed: false, effectiveTime: null, referenceTime: null },
  isStartTimeBegin: true,
  ...overrides,
});

const renderBadges = (data: AssessmentListData): void => {
  render(
    <StatusBadges for={data} isStudent={false} timelineAlgorithm={undefined} />,
  );
};

// The marketplace cases that used to live here moved with the chip: two to
// MarketplaceVersionChip.test.tsx in Task 3, and the rest to AssessmentsTable.test.tsx, which is
// where the chip now renders. They are deleted rather than inverted into absence assertions — a
// removed behaviour gets its tests removed, not rewritten to assert it is gone.
describe('<StatusBadges />', () => {
  it('marks an unpublished assessment as a draft', async () => {
    renderBadges(assessment({ published: false }));

    expect(await screen.findByText('Draft')).toBeVisible();
  });
});
