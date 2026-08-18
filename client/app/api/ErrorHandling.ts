import { AxiosError, AxiosResponse } from 'axios';

import { AUTH_USER_MANAGER } from 'lib/components/wrappers/AuthProvider';
import {
  redirectToForbidden,
  redirectToNotFound,
  redirectToSuspended,
} from 'lib/hooks/router/redirect';

export const isInvalidCSRFTokenResponse = (response?: AxiosResponse): boolean =>
  response?.status === 403 &&
  response.data?.error
    ?.toLowerCase()
    .includes("can't verify csrf token authenticity"); // NOTE: This string is taken from BE's handle_csrf_error

export const isUnauthenticatedResponse = (response?: AxiosResponse): boolean =>
  response?.status === 401;

const isUnauthorizedResponse = (response?: AxiosResponse): boolean =>
  response?.status === 403 &&
  !response.data?.is_suspended &&
  response.data?.errors?.toLowerCase().includes('not authorized'); // NOTE: This string is taken from CanCanCan's error message

const isComponentNotFoundResponse = (response?: AxiosResponse): boolean =>
  response?.status === 404 &&
  response.data?.error?.toLowerCase().includes('component not found'); // NOTE: This string is taken from BE's handle_component_not_found

const isSuspendedResponse = (response?: AxiosResponse): boolean =>
  response?.status === 403 && response.data?.is_suspended === true;

export const redirectIfMatchesErrorIn = (response?: AxiosResponse): void => {
  if (isUnauthenticatedResponse(response))
    AUTH_USER_MANAGER.signinRedirect({ redirect_uri: window.location.href });
  if (isSuspendedResponse(response)) redirectToSuspended();
  if (isUnauthorizedResponse(response))
    // Should open a new window and login
    redirectToForbidden();
  if (isComponentNotFoundResponse(response)) redirectToNotFound();
};

/**
 * Redirects to the not-found page if `error` is a 404 response, and returns whether it
 * did, so callers can skip their own error handling.
 *
 * The backend 404s when a resource doesn't exist under the parent resource in the URL,
 * even if it exists under another parent, so this covers both a nonexistent ID and an
 * ID belonging to someone else's course or assessment.
 *
 * This is opt-in rather than part of `redirectIfMatchesErrorIn` because some endpoints
 * legitimately 404 as part of their normal flow, and expect to handle it themselves.
 */
export const redirectToNotFoundIfMissing = (error: unknown): boolean => {
  const missing = (error as AxiosError)?.response?.status === 404;
  if (missing) redirectToNotFound();
  return missing;
};
