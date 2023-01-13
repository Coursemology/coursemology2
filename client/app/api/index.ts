import AnnouncementsAPI from './Announcements';
import UsersAPI from './Users';

const GlobalAPI = {
  announcements: new AnnouncementsAPI(),
  users: new UsersAPI(),
};

Object.freeze(GlobalAPI);

export default GlobalAPI;
