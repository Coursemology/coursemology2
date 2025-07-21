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
import PlagiarismAPI from './Plagiarism';
import ReferenceTimelinesAPI from './ReferenceTimelines';
import StatisticsAPI from './Statistics';
import StoriesAPI from './Stories';
import SurveyAPI from './Survey';
import UserEmailSubscriptionsAPI from './UserEmailSubscriptions';
import UserInvitationsAPI from './UserInvitations';
import UserNotificationsAPI from './UserNotifications';
import UsersAPI from './Users';
import VideoAPI from './Video';
import VideoSubmissionsAPI from './VideoSubmissions';

const CourseAPI = {
  achievements: new AchievementsAPI(),
  admin: AdminAPI,
  announcements: new AnnouncementsAPI(),
  assessment: AssessmentAPI,
  comments: new CommentsAPI(),
  conditions: new ConditionsAPI(),
  courses: new CoursesAPI(),
  disbursement: new DisbursementAPI(),
  duplication: new DuplicationAPI(),
  enrolRequests: new EnrolRequestsAPI(),
  experiencePointsRecord: new ExperiencePointsRecordAPI(),
  folders: new FoldersAPI(),
  forum: ForumAPI,
  groups: new GroupsAPI(),
  leaderboard: new LeaderboardAPI(),
  learningMap: new LearningMapAPI(),
  lessonPlan: new LessonPlanAPI(),
  level: new LevelAPI(),
  materials: new MaterialsAPI(),
  materialFolders: new MaterialFoldersAPI(),
  personalTimes: new PersonalTimesAPI(),
  plagiarism: new PlagiarismAPI(),
  referenceTimelines: new ReferenceTimelinesAPI(),
  statistics: StatisticsAPI,
  submissions: new SubmissionsAPI(),
  survey: SurveyAPI,
  users: new UsersAPI(),
  userInvitations: new UserInvitationsAPI(),
  video: VideoAPI,
  videoSubmissions: new VideoSubmissionsAPI(),
  userEmailSubscriptions: new UserEmailSubscriptionsAPI(),
  userNotifications: new UserNotificationsAPI(),
  stories: new StoriesAPI(),
};

Object.freeze(CourseAPI);

export default CourseAPI;
