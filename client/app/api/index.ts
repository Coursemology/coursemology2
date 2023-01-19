import AnnouncementsAPI from './Announcements';
import JobsAPI from './Jobs';
import UsersAPI from './Users';

const GlobalAPI = {
  announcements: new AnnouncementsAPI(),
  jobs: new JobsAPI(),
  users: new UsersAPI(),
};

Object.freeze(GlobalAPI);

export default GlobalAPI;
