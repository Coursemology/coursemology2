import { User } from 'oidc-client-ts';

const OIDC_STORAGE_KEY =
  `oidc.user:${process.env.OIDC_AUTHORITY}:${process.env.OIDC_CLIENT_ID}` as const;

export const getUserToken = (): string => {
  const oidcStorage = localStorage.getItem(OIDC_STORAGE_KEY);

  if (!oidcStorage) {
    return '';
  }
  const user = User.fromStorageString(oidcStorage);
  return user.access_token;
};

/**
 * Whether a signed-in session was ever stored, regardless of whether its access
 * token has since expired.
 */
export const hasStoredUser = (): boolean =>
  Boolean(localStorage.getItem(OIDC_STORAGE_KEY));

/**
 * Asks the server to expire the `access_token` cookie.
 *
 * The cookie is httponly, so nothing here can clear it directly - `document.cookie`, which every
 * client-side cookie library writes through, cannot see it at all. Only a server response can, and
 * until one does the cookie stays a usable credential for requests that carry no bearer token.
 *
 * Deliberately built on bare `fetch` rather than `BaseAPI`: the API layer reaches back into
 * `AuthProvider` for its 401 handling, and importing it from there would close an import cycle.
 */
export const revokeAccessTokenCookie = async (): Promise<void> => {
  const csrfResponse = await fetch('/csrf_token', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  const { csrfToken } = await csrfResponse.json();

  await fetch('/access_token', {
    method: 'DELETE',
    credentials: 'include',
    headers: { Accept: 'application/json', 'X-CSRF-Token': csrfToken },
  });
};
