import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { getUserToken } from 'utilities/authentication';

import { syncSignals } from 'lib/hooks/unread';

import {
  isInvalidCSRFTokenResponse,
  isUnauthenticatedResponse,
  redirectIfMatchesErrorIn,
} from './ErrorHandling';

const MAX_CSRF_RETRIES = 3 as const;
const MAX_AUTH_RETRIES = 5 as const;

const SIGNALS_HEADER_KEY = 'Signals-Sync' as const;

const updateSignalsIfPresentIn = (response: AxiosResponse): void => {
  const signals = response.headers[SIGNALS_HEADER_KEY.toLowerCase()];
  if (!signals) return;

  syncSignals(JSON.parse(signals));
};

const getAbsoluteURLWithoutHashFromAxiosRequestConfig = (
  config: InternalAxiosRequestConfig,
): string => {
  const url = new URL(window.location.href);
  url.pathname = config.url!;
  url.hash = '';

  Object.entries(config.params).forEach(([key, value]) =>
    url.searchParams.set(key, value as string),
  );

  return url.toString();
};

/**
 * We need this because Safe Exam Browser (SEB) only appends the config key hash in the
 * request headers as `X-SafeExamBrowser-ConfigKeyHash` without the original URL used
 * to hash it.
 *
 * The server shouldn't simply take the received request's URL because it's possible
 * that the server sits behind a reverse proxy and only receives the request via a
 * proxied internal URL. The safest way to ensure the server can correctly verify the
 * config key hash is to also include the request URL at request time.
 */
const appendRequestURLIfOnSEB = (config: InternalAxiosRequestConfig): void => {
  if (!navigator.userAgent.includes('SEB/')) return;

  config.headers['X-SafeExamBrowser-Url'] =
    getAbsoluteURLWithoutHashFromAxiosRequestConfig(config);
};

const getAuthorizationToken = (): string => {
  const userToken = getUserToken();
  return `Bearer ${userToken}`;
};

export default class BaseAPI {
  #client: AxiosInstance | null = null;

  #externalClient: AxiosInstance | null = null;

  #authentication_retries = 0;

  #csrf_retries = 0;

  /** Returns the API client */
  get client(): AxiosInstance {
    this.#client ??= this.#createAxiosInstance();
    return this.#client;
  }

  get externalClient(): AxiosInstance {
    this.#externalClient = axios.create();
    return this.#externalClient;
  }

  #createAxiosInstance(): AxiosInstance {
    const client = axios.create({
      headers: {
        Accept: 'application/json',
        Authorization: getAuthorizationToken(),
      },
      params: { format: 'json' },
    });

    client.interceptors.request.use(async (config) => {
      config.withCredentials = true;
      appendRequestURLIfOnSEB(config);
      if (config.method === 'get') return config;

      config.headers['X-CSRF-Token'] = await this.#getAndSaveCSRFToken();

      return config;
    });

    client.interceptors.response.use(
      (response) => {
        if (response.config.method !== 'get') {
          this.#csrf_retries = 0;
          this.#authentication_retries = 0;
        }

        updateSignalsIfPresentIn(response);

        return response;
      },
      async (error) => {
        if (
          isInvalidCSRFTokenResponse(error.response) &&
          this.#csrf_retries < MAX_CSRF_RETRIES
        ) {
          BaseAPI.#clearCSRFToken();
          this.#csrf_retries += 1;
          return client.request(error.config);
        }

        // When backend returns unauthenticated, it could be the case that the token has just expired
        // before the FE is able to refresh the token. Retry a few times to ensure the latest token
        // is used. Otherwise, redirect to sign in page.
        if (
          isUnauthenticatedResponse(error.response) &&
          this.#authentication_retries < MAX_AUTH_RETRIES
        ) {
          const config = error.config;
          config.headers.Authorization = getAuthorizationToken();
          this.#authentication_retries += 1;
          return client.request(config);
        }

        redirectIfMatchesErrorIn(error.response);

        return Promise.reject(error);
      },
    );

    return client;
  }

  static #clearCSRFToken(): void {
    window._CSRF_TOKEN = undefined;
  }

  async #getAndSaveCSRFToken(): Promise<string> {
    window._CSRF_TOKEN ??= await this.#getCSRFToken();
    return window._CSRF_TOKEN;
  }

  async #getCSRFToken(): Promise<string> {
    const response = await this.#client?.get('/csrf_token');
    return response?.data.csrfToken;
  }
}
