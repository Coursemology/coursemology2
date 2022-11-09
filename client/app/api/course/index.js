import SubmissionsAPI from './Assessment/Submissions/Submissions';
import FoldersAPI from './Material/Folders';
import AchievementsAPI from './Achievements';
import AdminAPI from './Admin';
import AnnouncementsAPI from './Announcements';
import AssessmentAPI from './Assessment';
import CommentsAPI from './Comments';
import ConditionsAPI from './Conditions';
import CoursesAPI from './Courses';
import DisbursementAPI from './Disbursement';
import DuplicationAPI from './Duplication';
import EnrolRequestsAPI from './EnrolRequests';
import ExperiencePointsRecordAPI from './ExperiencePointsRecord';
import ForumAPI from './Forum';
import GroupsAPI from './Groups';
import LeaderboardAPI from './Leaderboard';
import LearningMapAPI from './LearningMap';
import LessonPlanAPI from './LessonPlan';
import LevelAPI from './Level';
import MaterialFoldersAPI from './MaterialFolders';
import MaterialsAPI from './Materials';
import PersonalTimesAPI from './PersonalTimes';
import SurveyAPI from './Survey';
import UserEmailSubscriptionsAPI from './UserEmailSubscriptions';
import UserInvitationsAPI from './UserInvitations';
import UserNotificationsAPI from './UserNotifications';
import UsersAPI from './Users';
import VideoAPI from './Video';
import VideoSubmissionsAPI from './VideoSubmissions';

const CourseAPI = {
  achievements: new AchievementsAPI(),
  announcements: new AnnouncementsAPI(),
  assessment: AssessmentAPI,
  comments: new CommentsAPI(),
  conditions: new ConditionsAPI(),
  courses: new CoursesAPI(),
  folders: new FoldersAPI(),
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
  leaderboard: new LeaderboardAPI(),
  userInvitations: new UserInvitationsAPI(),
  enrolRequests: new EnrolRequestsAPI(),
  personalTimes: new PersonalTimesAPI(),
  submissions: new SubmissionsAPI(),
  disbursement: new DisbursementAPI(),
  forum: ForumAPI,
  experiencePointsRecord: new ExperiencePointsRecordAPI(),
  videoSubmissions: new VideoSubmissionsAPI(),
};

Object.freeze(CourseAPI);

export default CourseAPI;
