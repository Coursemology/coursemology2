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
import ScribingQuestionAPI from './Assessment/question/scribing';

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
  question: {
    scribing: ScribingQuestionAPI,
  },
};

Object.freeze(CourseAPI);

export default CourseAPI;
