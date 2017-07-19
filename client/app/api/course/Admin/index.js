import NotificationsAPI from './Notifications';

const AdminAPI = {
  notifications: new NotificationsAPI(),
};

Object.freeze(AdminAPI);

export default AdminAPI;
