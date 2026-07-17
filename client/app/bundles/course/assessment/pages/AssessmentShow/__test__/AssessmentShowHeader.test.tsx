import { fireEvent, render } from 'test-utils';

import AssessmentShowHeader from '../AssessmentShowHeader';

// Minimal AssessmentData: only `deleteUrl` + `title` are needed for the delete
// Prompt to render (see AssessmentShowHeader.tsx:71 / DeleteButton.tsx). All other
// action buttons stay hidden by leaving their URLs undefined, and the publish
// button stays hidden via `canPublishToMarketplace: false`.
const baseAssessment = {
  id: 1,
  title: 'Sample Assessment',
  deleteUrl: '/courses/1/assessments/1',
  status: 'open',
  permissions: {
    canAttempt: false,
    canManage: true,
    canObserve: true,
    canInviteToKoditsu: false,
    canPublishToMarketplace: false,
  },
  isPublishedToMarketplace: false,
};

// Test the conditional <PromptText> in the delete Prompt whose
// message contains this phrase, rendered only when `isPublishedToMarketplace`.
const MARKETPLACE_WARNING = /removes it from the marketplace/i;

describe('<AssessmentShowHeader />', () => {
  it('warns that deletion removes the marketplace listing when the assessment is listed', async () => {
    const page = render(
      <AssessmentShowHeader
        with={{ ...baseAssessment, isPublishedToMarketplace: true } as never}
      />,
    );

    // First query awaits the i18n LoadingIndicator; subsequent getBy* are sync.
    fireEvent.click(await page.findByLabelText('Delete Assessment')); // opens the delete Prompt
    expect(page.getByText(MARKETPLACE_WARNING)).toBeVisible();
  });

  it('shows no marketplace warning when the assessment is not listed', async () => {
    const page = render(
      <AssessmentShowHeader
        with={{ ...baseAssessment, isPublishedToMarketplace: false } as never}
      />,
    );

    fireEvent.click(await page.findByLabelText('Delete Assessment')); // delete Prompt still opens
    expect(page.queryByText(MARKETPLACE_WARNING)).not.toBeInTheDocument();
  });
});
