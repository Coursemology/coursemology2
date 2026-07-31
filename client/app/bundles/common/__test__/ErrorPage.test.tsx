import { render } from 'test-utils';
import { HomeLayoutData } from 'types/home';

import ErrorPage from '../ErrorPage';

// `NotFoundPage` renders inside `CourselessContainer`'s outlet, which forwards the root payload as the
// outlet context `useAppContext()` reads. There is no outlet here, so the payload is supplied directly.
const mockAppContext: HomeLayoutData = { locale: 'en', timeZone: null };

jest.mock('lib/containers/AppContainer', () => ({
  ...jest.requireActual('lib/containers/AppContainer'),
  useAppContext: (): HomeLayoutData => mockAppContext,
}));

describe('NotFoundPage', () => {
  beforeEach(() => {
    delete mockAppContext.isPreviewRestricted;
    window.history.replaceState(null, '', '/');
  });

  it('offers a link home', async () => {
    const page = render(<ErrorPage.NotFound />);

    expect(
      (await page.findByText('go back home')).closest('a'),
    ).toHaveAttribute('href', '/');
  });

  it('omits the link home for a restricted previewer', async () => {
    mockAppContext.isPreviewRestricted = true;

    const page = render(<ErrorPage.NotFound />);

    expect(
      await page.findByText(
        "Check if you've typed the correct address, or try again later.",
      ),
    ).toBeInTheDocument();
    expect(page.queryByText('go back home')).not.toBeInTheDocument();
  });

  // A 404 raised after a route already matched arrives here by redirect, so the address bar reads
  // `/404` rather than the page the viewer actually asked for. Putting it back is what makes this
  // read like the catch-all's not-found page, which never leaves the address it was typed at.
  describe('when redirected from a page whose record was missing', () => {
    const sourceURL = '/courses/8/assessments/33/submissions/818/edit';

    beforeEach(() => {
      window.history.replaceState(
        null,
        '',
        `/404?from=${encodeURIComponent(sourceURL)}`,
      );
    });

    it('restores the address it was redirected from', async () => {
      const page = render(<ErrorPage.NotFound />);

      await page.findByText("That location doesn't exist in this universe...");

      expect(window.location.pathname + window.location.search).toBe(sourceURL);
    });

    it('names that address rather than /404', async () => {
      const page = render(<ErrorPage.NotFound />);

      expect(await page.findByText(sourceURL)).toBeInTheDocument();
      expect(page.queryByText('/404')).not.toBeInTheDocument();
    });
  });

  // The catch-all reaches this page without a redirect, so there is nothing to restore and the
  // address is already the right one to show.
  it('leaves an address it was not redirected to alone', async () => {
    window.history.replaceState(null, '', '/courses/8/nonsense');

    const page = render(<ErrorPage.NotFound />);

    expect(await page.findByText('/courses/8/nonsense')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/courses/8/nonsense');
  });
});
