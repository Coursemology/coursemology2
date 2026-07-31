import { withAuthenticationRequired } from 'react-oidc-context';
import { Navigate, useSearchParams } from 'react-router-dom';

const NEXT_URL_SEARCH_PARAM = 'next';
const EXPIRED_SESSION_SEARCH_PARAM = 'expired';
const FORBIDDEN_SOURCE_URL_SEARCH_PARAM = 'from';

/**
 * Defensively parse a URL, returning `null` if a valid URL cannot be created. This
 * is because the `URL` constructor throws a `TypeError` if the URL is invalid. We
 * don't want to block page load just because of an invalid URL.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#exceptions
 */
const defensivelyParseURL = (rawURL: string): string | null => {
  try {
    const url = new URL(rawURL, window.location.origin);
    return url.pathname + url.search;
  } catch {
    return null;
  }
};

const getCurrentURL = (): string =>
  window.location.pathname + window.location.search;

const getForbiddenURL = (): string => {
  const url = new URL('/forbidden', window.location.origin);
  url.searchParams.append(FORBIDDEN_SOURCE_URL_SEARCH_PARAM, getCurrentURL());
  return url.pathname + url.search;
};

export const useNextURL = (): { nextURL: string | null; expired: boolean } => {
  const [searchParams] = useSearchParams();
  const nextRawURL = searchParams.get(NEXT_URL_SEARCH_PARAM);
  const expired = searchParams.get(EXPIRED_SESSION_SEARCH_PARAM);

  return {
    nextURL: nextRawURL && defensivelyParseURL(nextRawURL),
    expired: Boolean(expired),
  };
};

export const redirectToForbidden = (): void => {
  window.location.href = getForbiddenURL();
};

export const redirectToSuspended = (): void => {
  const url = new URL('/suspended', window.location.origin);
  url.searchParams.append(FORBIDDEN_SOURCE_URL_SEARCH_PARAM, getCurrentURL());
  window.location.href = url.pathname + url.search;
};

// Carries the address it was called from, the way `redirectToForbidden` and `redirectToSuspended` do.
// The not-found page is standalone, so reaching it means leaving the page that 404ed; without the
// source URL the viewer is shown `/404` instead of the address they actually asked for, which the
// route catch-all — every other way of reaching this page — never does.
//
// Split from the assignment like `getForbiddenURL` so the URL it builds can be asserted on: jsdom
// forbids stubbing `window.location`, so a test cannot observe the assignment itself.
export const getNotFoundURL = (): string => {
  const url = new URL('/404', window.location.origin);
  url.searchParams.append(FORBIDDEN_SOURCE_URL_SEARCH_PARAM, getCurrentURL());
  return url.pathname + url.search;
};

export const redirectToNotFound = (): void => {
  window.location.href = getNotFoundURL();
};

export const getForbiddenSourceURL = (rawURL: string): string | null => {
  const url = new URL(rawURL);
  return url.searchParams.get(FORBIDDEN_SOURCE_URL_SEARCH_PARAM);
};

export const getSuspendedSourceURL = (rawURL: string): string | null => {
  const url = new URL(rawURL);
  return url.searchParams.get(FORBIDDEN_SOURCE_URL_SEARCH_PARAM);
};

// Parsed defensively, unlike its two siblings: the not-found page hands this straight to
// `history.replaceState`, and `defensivelyParseURL` reduces whatever arrives to a path on this
// origin, so a crafted `?from=` cannot rewrite the address bar to somewhere else.
export const getNotFoundSourceURL = (rawURL: string): string | null => {
  const sourceURL = new URL(rawURL).searchParams.get(
    FORBIDDEN_SOURCE_URL_SEARCH_PARAM,
  );

  return sourceURL && defensivelyParseURL(sourceURL);
};

/**
 * Redirects to the next URL if it exists, otherwise redirects to the home page.
 */
export const Redirectable = (): JSX.Element => {
  const { nextURL } = useNextURL();
  return <Navigate to={nextURL ?? '/'} />;
};

/**
 * Redirects to the sign in page with the current intercepted URL as the next URL.
 */
const AuthenticatableComponent = (): JSX.Element => <div />;
export const Authenticatable = withAuthenticationRequired(
  AuthenticatableComponent,
  { signinRedirectArgs: { redirect_uri: window.location.href } },
);

export const useRedirectable = (): {
  redirectable: boolean;
  expired: boolean;
} => {
  const { nextURL, expired } = useNextURL();

  return { redirectable: Boolean(nextURL?.trim()), expired };
};
