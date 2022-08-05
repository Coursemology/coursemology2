import AdminAPI from './Admin';
import InstanceAdminAPI from './InstanceAdmin';

const SystemAPI = {
  admin: new AdminAPI(),
  instance: new InstanceAdminAPI(),
};

Object.freeze(SystemAPI);

export default SystemAPI;
