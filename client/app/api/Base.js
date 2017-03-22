import axios from 'axios';
import { csrfToken } from 'lib/helpers/server-context';

export default class BaseAPI {
  constructor() {
    this.client = null;
  }

  /** Returns the API client */
  getClient() {
    if (this.client) return this.client;

    const headers = { Accept: 'application/json', 'X-CSRF-Token': csrfToken };

    this.client = axios.create({ headers });
    return this.client;
  }
}
