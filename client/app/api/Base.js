import axios from 'axios';
import { csrfToken } from 'lib/helpers/server-context';

let pendingRequestCount = 0;

axios.interceptors.request.use((config) => {
  pendingRequestCount += 1;
  return config;
}, Promise.reject);

axios.interceptors.response.use(
  (response) => {
    pendingRequestCount -= 1;
    return response;
  },
  (error) => {
    pendingRequestCount -= 1;
    return Promise.reject(error);
  },
);

window.pendingRequestCount = pendingRequestCount;

export default class BaseAPI {
  constructor() {
    this.client = null;
  }

  /** Returns the API client */
  getClient() {
    if (this.client) return this.client;

    const headers = { Accept: 'application/json', 'X-CSRF-Token': csrfToken };
    const params = { format: 'json' };

    this.client = axios.create({ headers, params });
    return this.client;
  }
}
