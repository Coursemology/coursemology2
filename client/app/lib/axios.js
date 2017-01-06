import originAxios from 'axios';

let token;
const tag = document.querySelector('meta[name="csrf-token"]');
if (tag) {
  token = tag.getAttribute('content');
}

const headers = { Accept: 'application/json', 'X-CSRF-Token': token };

const axios = originAxios.create({ headers });
export default axios;
