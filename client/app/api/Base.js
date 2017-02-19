import axios from 'axios';

export default class BaseAPI {
  constructor() {
    this.client = null;
  }

  /** Returns the API client */
  getClient() {
    if (this.client) return this.client;

    let token;
    const tag = document.querySelector('meta[name="csrf-token"]');
    if (tag) {
      token = tag.getAttribute('content');
    }

    const headers = { Accept: 'application/json', 'X-CSRF-Token': token };

    this.client = axios.create({ headers });
    return this.client;
  }
}
