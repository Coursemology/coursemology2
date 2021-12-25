import AchievementsAPI from './Achievements';
import AdminAPI from './Admin';
import AssessmentAPI from './Assessment';
import CommentsAPI from './Comments';
import DuplicationAPI from './Duplication';
import LessonPlanAPI from './LessonPlan';
import LevelAPI from './Level';
import MaterialFoldersAPI from './MaterialFolders';
import MaterialsAPI from './Materials';
import SurveyAPI from './Survey';
import UserEmailSubscriptionsAPI from './UserEmailSubscriptions';
import UserNotificationsAPI from './UserNotifications';
import VideoAPI from './Video';
import VirtualClassroomsAPI from './VirtualClassrooms';

const CourseAPI = {
  achievements: new AchievementsAPI(),
  assessment: AssessmentAPI,
  comments: new CommentsAPI(),
  virtualClassrooms: new VirtualClassroomsAPI(),
  materials: new MaterialsAPI(),
  materialFolders: new MaterialFoldersAPI(),
  lessonPlan: new LessonPlanAPI(),
  duplication: new DuplicationAPI(),
  survey: SurveyAPI,
  video: VideoAPI,
  admin: AdminAPI,
  level: new LevelAPI(),
  userNotifications: new UserNotificationsAPI(),
  userEmailSubscriptions: new UserEmailSubscriptionsAPI(),
};

Object.freeze(CourseAPI);

export default CourseAPI;
