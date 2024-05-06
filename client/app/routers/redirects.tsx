import { RouteObject } from 'react-router-dom';

import { Authenticatable, Redirectable } from 'lib/hooks/router/redirect';

/**
 * Routes that are only available when the app is unauthenticated.
 *
 * For example, `users/:userId` in `AuthenticatedApp` matches the
 * authentication pages' routes when it shouldn't.
 */
export const reservedRoutes: RouteObject = {
  path: 'users',
  element: <Redirectable />,
  children: [
    { path: 'sign_up/*' },
    { path: 'confirmation/new/*' },
    { path: 'password/*' },
  ],
};

/**
 * Routes that are only available when the app is authenticated. Accessing
 * these routes when unauthenticated will trigger a redirectable redirect
 * to the sign in page.
 */
export const protectedRoutes: RouteObject = {
  path: '*',
  element: <Authenticatable />,
  children: [
    { path: 'courses/:courseId/*' },
    { path: 'admin/*' },
    { path: 'announcements' },
    { path: 'users/:userId' },
    { path: 'user/*' },
    { path: 'role_requests' },
  ],
};
