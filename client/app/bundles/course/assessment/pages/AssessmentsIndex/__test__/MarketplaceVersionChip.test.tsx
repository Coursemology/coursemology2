import userEvent from '@testing-library/user-event';
import { render } from 'test-utils';
import { MarketplaceVersionData } from 'types/course/assessment/assessments';

import MarketplaceVersionChip from '../MarketplaceVersionChip';

// '2026-07-24T07:04:00Z' rendered in Asia/Singapore (UTC+8).
const PUBLISHED_AT_LABEL = '24 Jul 2026, 3:04pm';

const snapshot = (
  overrides: Partial<MarketplaceVersionData> = {},
): MarketplaceVersionData => ({
  listingId: 7,
  publishedAt: '2026-07-24T07:04:00Z',
  source: 'MP Allowlist Source Course',
  latest: false,
  listed: true,
  ...overrides,
});

describe('<MarketplaceVersionChip />', () => {
  // One container tab holds every snapshot of every listing under identical titles, so siblings ARE
  // side by side here — the time is what tells two same-day cuts apart.
  it('labels a snapshot with its publish date and time', async () => {
    const page = render(<MarketplaceVersionChip for={snapshot()} />);

    expect(await page.findByText(PUBLISHED_AT_LABEL)).toBeInTheDocument();
  });

  it('labels the working copy as the source assessment rather than a date', async () => {
    const page = render(
      <MarketplaceVersionChip
        for={snapshot({ publishedAt: null, source: null })}
      />,
    );

    expect(await page.findByText('Source Assessment')).toBeInTheDocument();
    expect(page.queryByText(/2026/)).not.toBeInTheDocument();
  });

  it('marks the newest version of a published listing as Live, alongside its date', async () => {
    const page = render(
      <MarketplaceVersionChip for={snapshot({ latest: true, listed: true })} />,
    );

    expect(await page.findByText('Live')).toBeInTheDocument();
    // The date is not replaced by the status — an admin needs both.
    expect(page.getByText(PUBLISHED_AT_LABEL)).toBeInTheDocument();
    // Live and Latest are mutually exclusive: Live is the stronger of the two and stands in for it.
    expect(page.queryByText('Latest')).not.toBeInTheDocument();
  });

  // An unlisted listing still HAS a newest version — it is what an admin re-publishing acts on — but
  // nothing is being served, so it must not read Live.
  it('marks the newest version of an unlisted listing as Latest, not Live', async () => {
    const page = render(
      <MarketplaceVersionChip
        for={snapshot({ latest: true, listed: false })}
      />,
    );

    expect(await page.findByText('Latest')).toBeInTheDocument();
    expect(page.queryByText('Live')).not.toBeInTheDocument();
  });

  it('marks a superseded snapshot neither Live nor Latest', async () => {
    const page = render(
      <MarketplaceVersionChip
        for={snapshot({ latest: false, listed: true })}
      />,
    );

    expect(await page.findByText(PUBLISHED_AT_LABEL)).toBeInTheDocument();
    expect(page.queryByText('Live')).not.toBeInTheDocument();
    expect(page.queryByText('Latest')).not.toBeInTheDocument();
  });

  // Unreachable today — the backend hardcodes `latest: false` for the working copy — but
  // constructible here, and the two classifiers must not be able to disagree: the Version filter in
  // AssessmentsTable already treats a null `publishedAt` as "Source Assessment" regardless of
  // `latest`, so this chip must never render Live or Latest alongside it.
  it('never marks the working copy Live or Latest, even if `latest` were true', async () => {
    const page = render(
      <MarketplaceVersionChip
        for={snapshot({ publishedAt: null, source: null, latest: true })}
      />,
    );

    expect(await page.findByText('Source Assessment')).toBeInTheDocument();
    expect(page.queryByText('Live')).not.toBeInTheDocument();
    expect(page.queryByText('Latest')).not.toBeInTheDocument();
  });

  it('identifies the listing by a stable id rather than an ordinal', async () => {
    const user = userEvent.setup();
    const page = render(
      <MarketplaceVersionChip for={snapshot({ listingId: 12 })} />,
    );

    await user.hover(await page.findByText(PUBLISHED_AT_LABEL));

    const tooltip = await page.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(
      'Listing ID 12 · from MP Allowlist Source Course',
    );
    // "#12" reads as a position in a list, which is what made an admin expect it to renumber when a
    // neighbouring listing was deleted. It is a primary key and never moves.
    expect(tooltip).not.toHaveTextContent('#12');
  });

  it('names the listing alone when the source course was never recorded', async () => {
    const user = userEvent.setup();
    const page = render(
      <MarketplaceVersionChip
        for={snapshot({ listingId: 12, source: null })}
      />,
    );

    await user.hover(await page.findByText(PUBLISHED_AT_LABEL));

    const tooltip = await page.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Listing ID 12');
    expect(tooltip).not.toHaveTextContent('from');
  });

  it('says the working copy is not a published version', async () => {
    const user = userEvent.setup();
    const page = render(
      <MarketplaceVersionChip
        for={snapshot({ listingId: 12, publishedAt: null, source: null })}
      />,
    );

    await user.hover(await page.findByText('Source Assessment'));

    expect(await page.findByRole('tooltip')).toHaveTextContent(
      'Listing ID 12 · editable working copy, not a published version',
    );
  });
});
