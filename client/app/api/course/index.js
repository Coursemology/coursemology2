import AchievementsAPI from './Achievements';
import AssessmentAPI from './Assessment';
import CommentsAPI from './Comments';
import VirtualClassroomsAPI from './VirtualClassrooms';
import MaterialsAPI from './Materials';
import MaterialFoldersAPI from './MaterialFolders';
import LessonPlanAPI from './LessonPlan';
import DuplicationAPI from './Duplication';
import SurveyAPI from './Survey';
import VideoAPI from './Video';
import AdminAPI from './Admin';
import LevelAPI from './Level';
import UserNotificationsAPI from './UserNotifications';
import UserEmailSubscriptionsAPI from './UserEmailSubscriptions';
import GroupsAPI from './Groups';
import LearningMapAPI from './LearningMap';
import UsersAPI from './Users';

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
  groups: new GroupsAPI(),
  learningMap: new LearningMapAPI(),
  users: new UsersAPI(),
};

Object.freeze(CourseAPI);

export default CourseAPI;
