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
import ForumsAPI from './Forums';
import UserNotificationsAPI from './UserNotifications';

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
  forums: new ForumsAPI(),
  userNotifications: new UserNotificationsAPI(),
};

Object.freeze(CourseAPI);

export default CourseAPI;
