import axios, { AxiosInstance, AxiosResponse } from 'axios';

import {
  redirectToForbidden,
  redirectToSignIn,
} from 'lib/hooks/router/redirect';

const isInvalidCSRFTokenResponse = (response?: AxiosResponse): boolean =>
  response?.status === 403 &&
  response.data?.error?.title?.toLowerCase().includes('csrf token');

const isUnauthenticatedResponse = (response?: AxiosResponse): boolean =>
  response?.status === 401 &&
  response.data?.error?.toLowerCase().includes('sign in or sign up');

const isUnauthorizedResponse = (response?: AxiosResponse): boolean =>
  response?.status === 403 &&
  response.data?.errors?.toLowerCase().includes('not authorized');

const MAX_CSRF_RETRIES = 3;

export default class BaseAPI {
  #client: AxiosInstance | null = null;

  #retries = 0;

  /** Returns the API client */
  get client(): AxiosInstance {
    this.#client ??= this.#createAxiosInstance();
    return this.#client;
  }

  #createAxiosInstance(): AxiosInstance {
    const client = axios.create({
      headers: { Accept: 'application/json' },
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

        if (isUnauthenticatedResponse(error.response)) redirectToSignIn(true);

        if (isUnauthorizedResponse(error.response)) redirectToForbidden();

        return Promise.reject(error);
      },
    );

    return client;
  }

  static #clearCSRFToken(): void {
    globalThis._CSRF_TOKEN = undefined;
  }

  async #getAndSaveCSRFToken(): Promise<string> {
    globalThis._CSRF_TOKEN ??= await this.#getCSRFToken();
    return globalThis._CSRF_TOKEN;
  }

  async #getCSRFToken(): Promise<string> {
    const response = await this.#client?.get('/csrf_token');
    return response?.data.csrfToken;
  }
}
