import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor, within } from 'test-utils';

import CourseAPI from 'api/course';
import { SUPPORT_EMAIL } from 'lib/constants/sharedConstants';

import AssessmentShowHeader from '../AssessmentShowHeader';

const mock = createMockAdapter(CourseAPI.marketplace.client);
beforeEach(() => mock.reset());

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
const MARKETPLACE_WARNING = /keeps serving its last published version/i;
const DELETE_ASSESSMENT_LABEL = 'Delete Assessment';

describe('<AssessmentShowHeader />', () => {
  it('explains that the marketplace listing survives deletion when the assessment is listed', async () => {
    const page = render(
      <AssessmentShowHeader
        with={{ ...baseAssessment, isPublishedToMarketplace: true } as never}
      />,
    );

    // First query awaits the i18n LoadingIndicator; subsequent getBy* are sync.
    fireEvent.click(await page.findByLabelText(DELETE_ASSESSMENT_LABEL)); // opens the delete Prompt
    expect(page.getByText(MARKETPLACE_WARNING)).toBeVisible();
  });

  it('names the assessment right after the intro line, before the marketplace explanation', async () => {
    const page = render(
      <AssessmentShowHeader
        with={{ ...baseAssessment, isPublishedToMarketplace: true } as never}
      />,
    );

    fireEvent.click(await page.findByLabelText(DELETE_ASSESSMENT_LABEL));

    const content = page.getByRole('dialog').textContent ?? '';
    const positions = [
      'You are about to delete the following assessment:',
      baseAssessment.title,
      'keeps serving its last published version',
      'This action cannot be undone!',
    ].map((phrase) => content.indexOf(phrase));

    // -1 would make the ascending check vacuously true, so require every phrase.
    expect(positions).not.toContain(-1);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('links to support so the listing can be unlisted', async () => {
    const page = render(
      <AssessmentShowHeader
        with={{ ...baseAssessment, isPublishedToMarketplace: true } as never}
      />,
    );

    fireEvent.click(await page.findByLabelText(DELETE_ASSESSMENT_LABEL));

    expect(page.getByRole('link', { name: /contact us/i })).toHaveAttribute(
      'href',
      `mailto:${SUPPORT_EMAIL}`,
    );
  });

  // Internal vocabulary must not leak into the instructor-facing warning.
  it('calls the lost object the source assessment', async () => {
    const page = render(
      <AssessmentShowHeader
        with={{ ...baseAssessment, isPublishedToMarketplace: true } as never}
      />,
    );

    fireEvent.click(await page.findByLabelText(DELETE_ASSESSMENT_LABEL));

    const dialog = await page.findByRole('dialog');
    expect(within(dialog).getByText(/source assessment/)).toBeVisible();
    expect(
      within(dialog).queryByText(/authoring\s+copy/),
    ).not.toBeInTheDocument();
  });

  it('shows no marketplace warning when the assessment is not listed', async () => {
    const page = render(
      <AssessmentShowHeader
        with={{ ...baseAssessment, isPublishedToMarketplace: false } as never}
      />,
    );

    fireEvent.click(await page.findByLabelText(DELETE_ASSESSMENT_LABEL)); // delete Prompt still opens
    expect(page.queryByText(MARKETPLACE_WARNING)).not.toBeInTheDocument();
  });

  it('warns after the assessment is published in the same session', async () => {
    mock
      .onPost(`/courses/${global.courseId}/assessments/1/marketplace_listing`)
      .reply(200, { published: true });

    const page = render(
      <AssessmentShowHeader
        with={
          {
            ...baseAssessment,
            permissions: {
              ...baseAssessment.permissions,
              canPublishToMarketplace: true,
            },
          } as never
        }
      />,
    );

    fireEvent.click(await page.findByText('Publish to Marketplace')); // trigger button
    const publishPrompt = await page.findByRole('dialog');
    fireEvent.click(
      within(publishPrompt).getByRole('button', {
        name: /Publish to Marketplace/,
      }),
    );
    await waitFor(() => expect(mock.history.post).toHaveLength(1));

    // The warning reads the live state, not the initial `isPublishedToMarketplace` prop.
    fireEvent.click(page.getByLabelText('Delete Assessment'));
    expect(await page.findByText(MARKETPLACE_WARNING)).toBeVisible();
  });
});
