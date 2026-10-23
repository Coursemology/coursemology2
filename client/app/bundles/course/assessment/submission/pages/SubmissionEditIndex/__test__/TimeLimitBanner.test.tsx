import { render } from 'test-utils';

import TimeLimitBanner from '../TimeLimitBanner';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('<TimeLimitBanner />', () => {
  // The banner used to hide itself above 24h, because its formatter showed hours modulo 24 and
  // could not express days. A deadline-only assessment is commonly weeks out, so that hid the
  // countdown for most of the attempt.
  it('shows the countdown when the deadline is more than a day away', async () => {
    const page = render(
      <TimeLimitBanner forceSubmitRemainingTime={20 * DAY_MS} />,
    );

    expect(await page.findByText(/20 days/)).toBeVisible();
  });

  it('shows the countdown when the deadline is within the day', async () => {
    const page = render(
      <TimeLimitBanner forceSubmitRemainingTime={90 * 60 * 1000} />,
    );

    expect(await page.findByText(/1 hour and 30 minutes/)).toBeVisible();
  });

  // Under a second there is no unit left to name, so the banner moves on to the finalising
  // message instead of rendering an empty countdown.
  it('shows the finalising message rather than an empty countdown under a second', async () => {
    const page = render(<TimeLimitBanner forceSubmitRemainingTime={400} />);

    expect(await page.findByText(/Finalising in/i)).toBeVisible();
    expect(page.queryByText(/Time Remaining/i)).toBeNull();
  });

  it('announces that time is up once the grace period has elapsed', async () => {
    const page = render(<TimeLimitBanner forceSubmitRemainingTime={-60_000} />);

    expect(await page.findByText(/Time is Up/i)).toBeVisible();
  });

  // Only a deadline more than a day out gets the quiet treatment; nearer than that the banner keeps
  // its original urgent styling, which it may be showing for a long time otherwise.
  describe('styling', () => {
    const bannerFor = async (
      remainingTime: number,
      text: RegExp,
    ): Promise<Element | null> => {
      const page = render(
        <TimeLimitBanner forceSubmitRemainingTime={remainingTime} />,
      );

      return (await page.findByText(text)).closest('div.fixed');
    };

    it('is a quiet notice when the deadline is more than a day away', async () => {
      const banner = await bannerFor(20 * DAY_MS, /20 days/);

      expect(banner).toHaveClass('bg-white', 'text-black');
      expect(banner).toHaveClass('border-only-b-info', 'border-only-l-info');
    });

    it('stays urgent when the deadline is within the day', async () => {
      const banner = await bannerFor(2 * 60 * 60 * 1000, /2 hours/);

      expect(banner).toHaveClass('bg-red-700', 'text-white');
    });

    it('stays urgent once the deadline has passed', async () => {
      const banner = await bannerFor(-60_000, /Time is Up/i);

      expect(banner).toHaveClass('bg-yellow-700', 'text-white');
    });
  });
});
