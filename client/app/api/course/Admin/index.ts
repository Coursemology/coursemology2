import AnnouncementsAdminAPI from './Announcements';
import AssessmentsAdminAPI from './Assessments';
import BaseAdminAPI from './Base';
import CodaveriAdminAPI from './Codaveri';
import CommentsAdminAPI from './Comments';
import ComponentsAdminAPI from './Components';
import CourseAdminAPI from './Course';
import ForumsAdminAPI from './Forums';
import LeaderboardAdminAPI from './Leaderboard';
import LessonPlanSettingsAPI from './LessonPlan';
import MaterialsAdminAPI from './Materials';
import NotificationsSettingsAPI from './Notifications';
import SidebarAPI from './Sidebar';
import StoriesAdminAPI from './Stories';
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
  codaveri: new CodaveriAdminAPI(),
  stories: new StoriesAdminAPI(),
};

Object.freeze(AdminAPI);

export default AdminAPI;
