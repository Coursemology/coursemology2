import {
  matchRoutes,
  MemoryRouter,
  RouteObject,
  useLocation,
  useRoutes,
} from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import submissionsRouter from '../assessments/submissions';
import courseRouter from '../index';

const t = ((descriptor: { defaultMessage?: string }): string =>
  descriptor.defaultMessage ?? '') as Parameters<typeof courseRouter>[0];

const matchedLeaf = (pathname: string): RouteObject | undefined =>
  matchRoutes([courseRouter(t)], pathname)?.at(-1)?.route;

const matchedPaths = (pathname: string): (string | undefined)[] | null =>
  matchRoutes([courseRouter(t)], pathname)?.map(({ route }) => route.path) ??
  null;

// The real router, with only the redirect's destination stubbed out, so the assertion is about our
// index route and our relative `to` rather than about a hand-built fixture. Mounting the genuine
// `edit` leaf would pull in the whole submission page.
const routerWithStubbedEditPage = (): RouteObject => {
  const route = submissionsRouter(t);
  const submission = route.children?.find(
    (child) => child.path === ':submissionId',
  );
  const edit = submission?.children?.find((child) => child.path === 'edit');

  if (!edit) throw new Error('The :submissionId/edit route is missing.');

  delete edit.lazy;
  edit.element = <div>edit page</div>;

  return route;
};

// `useRoutes` rather than `createMemoryRouter`: the data router needs the fetch API globals, which
// jsdom does not define and which nothing in this suite's setup polyfills. It consumes the same route
// objects, and `Navigate`'s relative resolution — the thing under test — is identical either way.
const RoutedApp = (): JSX.Element | null =>
  useRoutes([
    {
      path: 'courses/:courseId/assessments/:assessmentId',
      children: [routerWithStubbedEditPage()],
    },
  ]);

const Pathname = (): JSX.Element => (
  <div data-testid="pathname">{useLocation().pathname}</div>
);

describe('assessment submission routes', () => {
  it('matches a submission page', () => {
    expect(
      matchedPaths('/courses/7/assessments/43/submissions/8183/edit'),
    ).toEqual([
      'courses/:courseId',
      'assessments',
      ':assessmentId',
      'submissions',
      ':submissionId',
      'edit',
    ]);
  });

  // `/submissions/:id` is not a page of its own — the Rails resource has no `show`, and every
  // submission link the app builds is an `edit_..._path`. It used to match the `:submissionId` route
  // itself, which had children but no index: React Router treats a parent with a path as its own
  // branch, so the URL rendered that route's empty default outlet — the course shell with a blank
  // content area, for any id, real or invented. An index route both removes the dead end and gives the
  // bare URL the meaning it should have had.
  it.each([
    '/courses/7/assessments/43/submissions/8183',
    '/courses/7/assessments/43/submissions/8183/',
    '/courses/7/assessments/43/submissions/818',
  ])('resolves %s to an index route rather than a dead end', (pathname) => {
    expect(matchedLeaf(pathname)?.index).toBe(true);
  });

  // Whether the id exists, and whether this viewer may open it, is the backend's call once we are on
  // `edit`: an id outside this assessment 404s, someone else's submission 403s, and your own renders.
  it('redirects a bare submission url to its edit page', async () => {
    render(
      <MemoryRouter
        initialEntries={['/courses/7/assessments/43/submissions/8183']}
      >
        <RoutedApp />
        <Pathname />
      </MemoryRouter>,
    );

    expect(await screen.findByText('edit page')).toBeInTheDocument();
    expect(screen.getByTestId('pathname').textContent).toBe(
      '/courses/7/assessments/43/submissions/8183/edit',
    );
  });
});
