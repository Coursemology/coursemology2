import { Navigation } from 'react-router-dom';

import { isNavigatingTo } from '../useNavigatingTo';

const asNavigation = (over: Partial<Navigation>): Navigation =>
  ({ state: 'idle', location: undefined, ...over }) as Navigation;

describe('isNavigatingTo', () => {
  // Clicking "Try it out" starts a slow SPA navigation (the attempt loader provisions the preview
  // copy, ~2-3s). While that navigation is pending toward this button's target, the button shows a
  // spinner — the comparison is by pathname so a trailing `?from_tab=…` on the link still matches.
  it('is true while loading toward the target pathname, ignoring the query string', () => {
    expect(
      isNavigatingTo(
        asNavigation({
          state: 'loading',
          location: { pathname: '/p/1/attempt' } as Navigation['location'],
        }),
        '/p/1/attempt?from_tab=42',
      ),
    ).toBe(true);
  });

  it('is false when the router is idle', () => {
    expect(isNavigatingTo(asNavigation({}), '/p/1/attempt')).toBe(false);
  });

  it('is false while loading toward a different target', () => {
    expect(
      isNavigatingTo(
        asNavigation({
          state: 'loading',
          location: { pathname: '/p/2/attempt' } as Navigation['location'],
        }),
        '/p/1/attempt',
      ),
    ).toBe(false);
  });
});
