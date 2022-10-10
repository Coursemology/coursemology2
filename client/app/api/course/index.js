import AchievementsAPI from './Achievements';
import AssessmentAPI from './Assessment';
import CommentsAPI from './Comments';
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
import CoursesAPI from './Courses';
import UsersAPI from './Users';
import LeaderboardAPI from './Leaderboard';
import AnnouncementsAPI from './Announcements';
import UserInvitationsAPI from './UserInvitations';
import EnrolRequestsAPI from './EnrolRequests';
import PersonalTimesAPI from './PersonalTimes';
import SubmissionsAPI from './Assessment/Submissions/Submissions';
import DisbursementAPI from './Disbursement';
import ForumAPI from './Forum';
import ExperiencePointsRecordAPI from './ExperiencePointsRecord';
import FoldersAPI from './Material/Folders';
import VideoSubmissionsAPI from './VideoSubmissions';

const CourseAPI = {
  achievements: new AchievementsAPI(),
  announcements: new AnnouncementsAPI(),
  assessment: AssessmentAPI,
  comments: new CommentsAPI(),
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
  forum: new ForumAPI(),
  experiencePointsRecord: new ExperiencePointsRecordAPI(),
  videoSubmissions: new VideoSubmissionsAPI(),
};

Object.freeze(CourseAPI);

export default CourseAPI;
