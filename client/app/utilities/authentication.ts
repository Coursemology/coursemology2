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

// The `format=json` is what routes a request to Rails rather than to the client app: the dev server
// serves the SPA for anything without it, so omitting it returns an HTML page with a 200.
const CSRF_TOKEN_URL = '/csrf_token?format=json' as const;
const ACCESS_TOKEN_URL = '/access_token?format=json' as const;

/**
 * Best effort, because a missing token is not worth abandoning the sign out over: the DELETE is
 * still attempted without the header, and fails loudly there instead of silently here.
 */
const fetchCsrfToken = async (): Promise<string | undefined> => {
  try {
    const response = await fetch(CSRF_TOKEN_URL, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return undefined;

    return (await response.json()).csrfToken;
  } catch {
    return undefined;
  }
};

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
  const csrfToken = await fetchCsrfToken();

  const response = await fetch(ACCESS_TOKEN_URL, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
    },
  });

  if (!response.ok)
    throw new Error(
      `Could not revoke the access token cookie: ${response.status}`,
    );
};
