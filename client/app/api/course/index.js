import AssessmentsAPI from './Assessments';
import VirtualClassroomsAPI from './VirtualClassrooms';
import MaterialsAPI from './Materials';
import MaterialFoldersAPI from './MaterialFolders';
import SurveyAPI from './Survey';

const CourseAPI = {
  assessments: new AssessmentsAPI(),
  virtualClassrooms: new VirtualClassroomsAPI(),
  materials: new MaterialsAPI(),
  materialFolders: new MaterialFoldersAPI(),
  survey: SurveyAPI,
};

Object.freeze(CourseAPI);

export default CourseAPI;
