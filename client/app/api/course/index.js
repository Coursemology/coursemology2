import AssessmentsAPI from './Assessments';
import VirtualClassroomsAPI from './VirtualClassrooms';
import MaterialsAPI from './Materials';
import MaterialFoldersAPI from './MaterialFolders';
import SurveyAPI from './Survey';
import ScribingAPI from './assessment/question/scribing';

const CourseAPI = {
  assessments: new AssessmentsAPI(),
  virtualClassrooms: new VirtualClassroomsAPI(),
  materials: new MaterialsAPI(),
  materialFolders: new MaterialFoldersAPI(),
  survey: SurveyAPI,
  scribing: ScribingAPI,
};

Object.freeze(CourseAPI);

export default CourseAPI;
