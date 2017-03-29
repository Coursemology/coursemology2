import originAxios from 'axios';
import { csrfToken } from 'lib/helpers/server-context';

const headers = { Accept: 'application/json', 'X-CSRF-Token': csrfToken };
const params = { format: 'json' };

const axios = originAxios.create({ headers, params });
export default axios;
