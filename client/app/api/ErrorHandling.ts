import { AxiosResponse } from 'axios';

import {
  redirectToAuthPage,
  redirectToBaseNotFound,
  redirectToForbidden,
  redirectToNotFound,
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
  response.data?.errors?.toLowerCase().includes('not authorized'); // NOTE: This string is taken from CanCanCan's error message

const isComponentNotFoundResponse = (response?: AxiosResponse): boolean =>
  response?.status === 404 &&
  response.data?.error?.toLowerCase().includes('component not found'); // NOTE: This string is taken from BE's handle_component_not_found

const isInstanceNotFoundResponse = (response?: AxiosResponse): boolean =>
  response?.status === 404 &&
  response.data?.error?.toLowerCase().includes('instance not found'); // NOTE: This string is taken from BE's handle_component_not_found

export const redirectIfMatchesErrorIn = (response?: AxiosResponse): void => {
  if (isUnauthenticatedResponse(response)) {
    localStorage.clear();
    redirectToAuthPage();
  }
  if (isUnauthorizedResponse(response))
    // Should open a new window and login
    redirectToForbidden();
  if (isComponentNotFoundResponse(response)) redirectToNotFound();
  if (isInstanceNotFoundResponse(response)) redirectToBaseNotFound();
};
