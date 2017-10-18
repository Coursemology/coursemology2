import AchievementsAPI from './Achievements';
import AssessmentAPI from './Assessment';
import CommentsAPI from './Comments';
import VirtualClassroomsAPI from './VirtualClassrooms';
import MaterialsAPI from './Materials';
import MaterialFoldersAPI from './MaterialFolders';
import LessonPlanAPI from './LessonPlan';
import DuplicationAPI from './Duplication';
import PostsAPI from './Posts';
import SurveyAPI from './Survey';
import VideoAPI from './Video';
import AdminAPI from './Admin';
import ScribingQuestionAPI from './Assessment/question/scribing';
import AnnouncementsAPI from './Announcements';

const CourseAPI = {
  achievements: new AchievementsAPI(),
  announcements: new AnnouncementsAPI(),
  assessment: AssessmentAPI,
  comments: new CommentsAPI(),
  virtualClassrooms: new VirtualClassroomsAPI(),
  materials: new MaterialsAPI(),
  materialFolders: new MaterialFoldersAPI(),
  lessonPlan: new LessonPlanAPI(),
  duplication: new DuplicationAPI(),
  posts: new PostsAPI(),
  survey: SurveyAPI,
  video: VideoAPI,
  admin: AdminAPI,
  question: {
    scribing: ScribingQuestionAPI,
  },
};

Object.freeze(CourseAPI);

export default CourseAPI;
