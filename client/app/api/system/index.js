import AdminAPI from './Admin';

const SystemAPI = {
  admin: new AdminAPI(),
};

Object.freeze(SystemAPI);

export default SystemAPI;
