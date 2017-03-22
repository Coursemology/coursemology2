import originAxios from 'axios';
import { csrfToken } from 'lib/helpers/server-context';

const headers = { Accept: 'application/json', 'X-CSRF-Token': csrfToken };

const axios = originAxios.create({ headers });
export default axios;
