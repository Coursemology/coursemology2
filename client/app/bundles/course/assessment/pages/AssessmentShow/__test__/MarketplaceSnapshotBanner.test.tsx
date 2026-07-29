import { render, RenderResult } from 'test-utils';
import { MarketplaceVersionData } from 'types/course/assessment/assessments';

import MarketplaceSnapshotBanner from '../MarketplaceSnapshotBanner';

/**
 * `NotificationPopup` mounts inside `I18nProvider` (see `Providers`), so its presence is the signal
 * that the provider resolved its messages and the banner has had its chance to render. Without this
 * gate an absence assertion passes vacuously, by running before anything has mounted at all.
 */
const settle = (page: RenderResult): Promise<HTMLElement> =>
  page.findByLabelText(/Notifications/);

const SOURCE_URL = 'http://origin.lvh.me/courses/3/assessments/9';

const snapshot = (
  overrides: Partial<MarketplaceVersionData> = {},
): MarketplaceVersionData => ({
  listingId: 7,
  publishedAt: '2026-07-24T07:04:00Z',
  source: 'MP Allowlist Source Course',
  latest: true,
  listed: true,
  sourceAssessmentUrl: SOURCE_URL,
  ...overrides,
});

describe('<MarketplaceSnapshotBanner />', () => {
  it('warns that a snapshot is frozen and sends the admin to the source assessment', async () => {
    const page = render(<MarketplaceSnapshotBanner version={snapshot()} />);

    expect(
      await page.findByText(/frozen at its publication date/),
    ).toBeInTheDocument();
    // `role="alert"` is what the two absence assertions below query on, so pin it here.
    expect(page.getByRole('alert')).toBeInTheDocument();

    // `href`, not `to`: a cross-instance absolute url must not be routed as an in-app path.
    const link = page.getByRole('link', { name: 'Open source assessment' });
    expect(link).toHaveAttribute('href', SOURCE_URL);
  });

  // An orphaned listing has no source to open yet. Saying so beats a dead or absent link.
  it('explains the missing source instead of linking when the listing is orphaned', async () => {
    const page = render(
      <MarketplaceSnapshotBanner
        version={snapshot({ sourceAssessmentUrl: null })}
      />,
    );

    expect(
      await page.findByText(/one is being rebuilt from this version/),
    ).toBeInTheDocument();
    expect(page.queryByRole('link')).not.toBeInTheDocument();
  });

  // `publishedAt === null` is the working copy, which is exactly what an admin is meant to edit —
  // the same discriminator MarketplaceVersionChip uses to label it "Source Assessment".
  it('renders nothing for the listing working copy', async () => {
    const page = render(
      <MarketplaceSnapshotBanner
        version={snapshot({
          publishedAt: null,
          sourceAssessmentUrl: undefined,
        })}
      />,
    );

    await settle(page);

    expect(page.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders nothing for an assessment the marketplace does not own', async () => {
    const page = render(<MarketplaceSnapshotBanner />);

    await settle(page);

    expect(page.queryByRole('alert')).not.toBeInTheDocument();
  });
});
