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
        // Authorization:
        //   'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkU0FLX24xbG81UFFEUWtUU1lJN203NXVFQUE5ZTgxdlVFS1dkMUhKUko0In0.eyJleHAiOjE3MDcyODY0MTksImlhdCI6MTcwNzI4NjExOSwiYXV0aF90aW1lIjoxNzA3MjgzNjUyLCJqdGkiOiIwYjcwZTVlNi1iMTYxLTRjYTktODUyMi1iODk4YWMzNzMzMDMiLCJpc3MiOiJodHRwOi8vbHZoLm1lOjg0NDMvcmVhbG1zL2NvdXJzZW1vbG9neSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI2NDJkZDE3Yy1iY2UwLTQxN2QtYTRmMS05MjhlMDQwMzg0ZDMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiIyNDA1NGU1NS1kY2FiLTRmZmItOTM5ZC1lYWVmNDM4ZWM2NmEiLCJzZXNzaW9uX3N0YXRlIjoiY2JmNGExODAtODk2Zi00NzM4LTgxNmItNTNlYTJlOTllNTBmIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLWNvdXJzZW1vbG9neSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwic2lkIjoiY2JmNGExODAtODk2Zi00NzM4LTgxNmItNTNlYTJlOTllNTBmIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJFa28gV2lkaWFudG8iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJla28ud2lkaWFudG9AYWlzaW5nYXBvcmUub3JnIiwiZ2l2ZW5fbmFtZSI6IkVrbyIsImZhbWlseV9uYW1lIjoiV2lkaWFudG8iLCJlbWFpbCI6ImVrby53aWRpYW50b0BhaXNpbmdhcG9yZS5vcmcifQ.Q26e7MwVC7GcwtuwHZDlAGbdevSwv_vVY_RRz7jDrycwzWblND4cqg9_x7_Qy5VL1E8GainqzhaNNnWf2tHPygDeofXpzpz0unMvv65G0q6JmHw_j8mVlVbP9nMzq90YSvbxTYvmwtp6VF7A29drqGpr_qSohg374JP4-BZEFgvLNgbgJvKjC8Z2m7q6DvVMf_vNqtqQY1T_Ml0S8kcN-QhJXzLPNHAkiznzjWblooxtd6gslHJYM5SE2lvyLPO5gngGjZXxZ6oEdkSVREad4rzQlG_DWd-nQix4uzsi8DrHy6ErzC0ACSGuJNYnBYiJhy_1-nEMl4RFRPEsMx9WqA',
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
