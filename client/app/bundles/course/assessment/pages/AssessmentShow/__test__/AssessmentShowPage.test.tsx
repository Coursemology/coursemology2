import { render, RenderResult } from 'test-utils';
import { AssessmentData } from 'types/course/assessment/assessments';

import AssessmentShowPage from '../AssessmentShowPage';

// Minimal AssessmentData: enough for the page to mount. Everything optional is left out so the
// assertions below can only be about the marketplace chip.
const baseAssessment = {
  id: 1,
  title: 'Sample Assessment',
  tabTitle: 'Assessments: Default',
  tabUrl: '/courses/1/assessments',
  description: '',
  autograded: false,
  startAt: { isFixed: false, effectiveTime: null, referenceTime: null },
  hasAttempts: false,
  status: 'open',
  actionButtonUrl: null,
  permissions: {
    canAttempt: true,
    canManage: true,
    canObserve: false,
    canInviteToKoditsu: false,
    canPublishToMarketplace: false,
  },
  isPublishedToMarketplace: false,
  marketplaceListingUrl: '/courses/1/assessments/1/marketplace_listing',
  marketplaceUpdate: null,
  requirements: [],
  indexUrl: '/courses/1/assessments',
  isStudent: false,
} as unknown as AssessmentData;

const renderWith = (
  marketplaceVersion?: AssessmentData['marketplaceVersion'],
): RenderResult =>
  render(
    <AssessmentShowPage for={{ ...baseAssessment, marketplaceVersion }} />,
  );

// '2026-07-24T07:04:00Z' rendered in Asia/Singapore (UTC+8), as in MarketplaceVersionChip's own test.
const PUBLISHED_AT_LABEL = '24 Jul 2026, 3:04pm';

describe('<AssessmentShowPage />', () => {
  // Every snapshot in the container carries the origin's title verbatim and shares one tab, so the
  // page has to say which one this is — otherwise opening a container row loses the identity the
  // index row showed.
  it('dates a container snapshot and marks it live', async () => {
    const page = renderWith({
      listingId: 7,
      publishedAt: '2026-07-24T07:04:00Z',
      source: 'MP Allowlist Source Course',
      latest: true,
      listed: true,
    });

    expect(await page.findByText(PUBLISHED_AT_LABEL)).toBeVisible();
    expect(page.getByText('Live')).toBeVisible();
  });

  // The working copy is not a version at all — mistaking it for one would read as though the
  // marketplace serves whatever an admin is midway through editing.
  it("labels the listing's working copy as the source assessment", async () => {
    const page = renderWith({
      listingId: 7,
      publishedAt: null,
      source: 'MP Allowlist Source Course',
      latest: false,
      listed: true,
    });

    expect(await page.findByText('Source Assessment')).toBeVisible();
    expect(page.queryByText('Live')).not.toBeInTheDocument();
    // Editing the working copy is the point, so it must not be warned against. The chip assertion
    // above is the async gate: once it is up, the banner has had its chance to render.
    expect(
      page.queryByText(/frozen at its publication date/),
    ).not.toBeInTheDocument();
  });

  it('shows no marketplace chip outside the container', async () => {
    const page = renderWith(undefined);

    expect(await page.findByText(baseAssessment.title)).toBeVisible();
    expect(page.queryByText(/2026/)).not.toBeInTheDocument();
    expect(page.queryByText('Source Assessment')).not.toBeInTheDocument();
    expect(
      page.queryByText(/frozen at its publication date/),
    ).not.toBeInTheDocument();
  });

  // The show page is the only route to a snapshot, so the warning has to reach it through the page,
  // not merely render in isolation.
  it('warns on the page when the assessment is a published snapshot', async () => {
    const page = renderWith({
      listingId: 7,
      publishedAt: '2026-07-24T07:04:00Z',
      source: 'MP Allowlist Source Course',
      latest: true,
      listed: true,
      sourceAssessmentUrl: 'http://origin.lvh.me/courses/3/assessments/9',
    });

    expect(
      await page.findByText(/frozen at its publication date/),
    ).toBeInTheDocument();
    expect(
      page.getByRole('link', { name: 'Open source assessment' }),
    ).toHaveAttribute('href', 'http://origin.lvh.me/courses/3/assessments/9');
  });
});
