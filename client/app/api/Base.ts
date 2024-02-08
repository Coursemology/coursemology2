import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User } from 'oidc-client-ts';

import { syncSignals } from 'lib/hooks/unread';

import {
  isInvalidCSRFTokenResponse,
  redirectIfMatchesErrorIn,
} from './ErrorHandling';

const MAX_CSRF_RETRIES = 3 as const;

const SIGNALS_HEADER_KEY = 'Signals-Sync' as const;

const updateSignalsIfPresentIn = (response: AxiosResponse): void => {
  const signals = response.headers[SIGNALS_HEADER_KEY.toLowerCase()];
  if (!signals) return;

  syncSignals(JSON.parse(signals));
};

const OIDC_STORAGE_KEY =
  `oidc.user:${process.env.OIDC_AUTHORITY}:${process.env.OIDC_CLIENT_ID}` as const;

const getUserToken = (): string => {
  const oidcStorage = localStorage.getItem(OIDC_STORAGE_KEY);

  if (!oidcStorage) {
    return '';
  }
  const user = User.fromStorageString(oidcStorage);
  return user.access_token;
};

export default class BaseAPI {
  #client: AxiosInstance | null = null;

  #retries = 0;

  /** Returns the API client */
  get client(): AxiosInstance {
    this.#client ??= this.#createAxiosInstance();
    return this.#client;
  }

  #createAxiosInstance(): AxiosInstance {
    const userToken = getUserToken();
    const client = axios.create({
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      params: { format: 'json' },
    });

    client.interceptors.request.use(async (config) => {
      config.withCredentials = true;
      if (config.method === 'get') return config;

      config.headers['X-CSRF-Token'] = await this.#getAndSaveCSRFToken();
      return config;
    });

    client.interceptors.response.use(
      (response) => {
        if (response.config.method !== 'get') this.#retries = 0;

        updateSignalsIfPresentIn(response);

        return response;
      },
      async (error) => {
        if (
          isInvalidCSRFTokenResponse(error.response) &&
          this.#retries < MAX_CSRF_RETRIES
        ) {
          BaseAPI.#clearCSRFToken();
          this.#retries += 1;
          return client.request(error.config);
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
