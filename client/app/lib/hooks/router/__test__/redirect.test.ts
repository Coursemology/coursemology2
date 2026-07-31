import { getNotFoundSourceURL, getNotFoundURL } from '../redirect';

// The not-found page is standalone by design, so reaching it means leaving the page that 404ed.
// Carrying the address along is what lets that page put it back, so a viewer sent here still sees the
// URL they asked for rather than `/404` — which is how every other route to that page behaves.
describe('getNotFoundURL', () => {
  it('carries the address it was called from', () => {
    window.history.replaceState(
      null,
      '',
      '/courses/8/assessments/33/submissions/818/edit',
    );

    expect(getNotFoundURL()).toBe(
      '/404?from=%2Fcourses%2F8%2Fassessments%2F33%2Fsubmissions%2F818%2Fedit',
    );
  });

  it('carries the query string too', () => {
    window.history.replaceState(null, '', '/courses/8/submissions/818?step=2');

    expect(getNotFoundURL()).toBe(
      '/404?from=%2Fcourses%2F8%2Fsubmissions%2F818%3Fstep%3D2',
    );
  });
});

describe('getNotFoundSourceURL', () => {
  it('reads back the address a redirect carried', () => {
    window.history.replaceState(null, '', '/courses/8/submissions/818?step=2');

    expect(getNotFoundSourceURL(`http://localhost${getNotFoundURL()}`)).toBe(
      '/courses/8/submissions/818?step=2',
    );
  });

  it('is null when there is none, as on the route catch-all', () => {
    expect(
      getNotFoundSourceURL('http://localhost/courses/8/nonsense'),
    ).toBeNull();
  });

  // Handed straight to `history.replaceState`, so a crafted `from` must not be able to rewrite the
  // address bar to another origin.
  it('reduces an off-origin address to a path on this one', () => {
    expect(
      getNotFoundSourceURL(
        'http://localhost/404?from=https%3A%2F%2Fevil.test%2Fx',
      ),
    ).toBe('/x');
  });
});
