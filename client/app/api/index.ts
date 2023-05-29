import AnnouncementsAPI from './Announcements';
import HomeAPI from './Home';
import JobsAPI from './Jobs';
import UsersAPI from './Users';

const GlobalAPI = {
  announcements: new AnnouncementsAPI(),
  jobs: new JobsAPI(),
  users: new UsersAPI(),
  home: new HomeAPI(),
};

Object.freeze(GlobalAPI);

export default GlobalAPI;
