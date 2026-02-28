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

const getAuthenticatableURL = (): string => {
  const url = new URL('/authentication', window.location.origin);
  return url.pathname + url.search;
};

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

/**
 * Redirects to the sign in page with the current URL as the next URL. To be used
 * in scopes outside React and/or React Router, e.g., Axios interceptors.
 * Do not redirect to the same /authentication url.
 *
 * @param expired Whether this redirect is caused by an expired session.
 */
export const redirectToAuthPage = (): void => {
  if (!window.location.pathname.startsWith('/auth'))
    window.location.href = getAuthenticatableURL();
};

export const redirectToForbidden = (): void => {
  window.location.href = getForbiddenURL();
};

export const redirectToNotFound = (): void => {
  window.location.href = '/404';
};

export const redirectToBaseNotFound = (): void => {
  const url = new URL(window.location.href);
  url.host = window.location.hostname.split('.').slice(-2).join('.');
  url.pathname = '/404';
  window.location.href = url.toString();
};

export const getForbiddenSourceURL = (rawURL: string): string | null => {
  const url = new URL(rawURL);
  return url.searchParams.get(FORBIDDEN_SOURCE_URL_SEARCH_PARAM);
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
