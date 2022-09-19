import BaseAdminAPI from './Base';
import CourseAdminAPI from './Course';
import ComponentsAdminAPI from './Components';
import SidebarAPI from './Sidebar';
import AnnouncementsAdminAPI from './Announcements';
import AssessmentsAdminAPI from './Assessments';
import CommentsAdminAPI from './Comments';
import LeaderboardAdminAPI from './Leaderboard';
import MaterialsAdminAPI from './Materials';
import LessonPlanSettingsAPI from './LessonPlan';
import NotificationsSettingsAPI from './Notifications';
import ForumsAdminAPI from './Forums';
import VideosAdminAPI from './Videos';

const AdminAPI = {
  system: new BaseAdminAPI(),
  course: new CourseAdminAPI(),
  components: new ComponentsAdminAPI(),
  sidebar: new SidebarAPI(),
  announcements: new AnnouncementsAdminAPI(),
  assessments: new AssessmentsAdminAPI(),
  comments: new CommentsAdminAPI(),
  leaderboard: new LeaderboardAdminAPI(),
  lessonPlan: new LessonPlanSettingsAPI(),
  materials: new MaterialsAdminAPI(),
  forums: new ForumsAdminAPI(),
  videos: new VideosAdminAPI(),
  notifications: new NotificationsSettingsAPI(),
};

Object.freeze(AdminAPI);

export default AdminAPI;
