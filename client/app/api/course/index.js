import AssessmentsAPI from './Assessments';
import MaterialsAPI from './Materials';
import MaterialFoldersAPI from './MaterialFolders';
import SurveyAPI from './Survey';

const CourseAPI = {
  assessments: new AssessmentsAPI(),
  materials: new MaterialsAPI(),
  materialFolders: new MaterialFoldersAPI(),
  survey: SurveyAPI,
};

Object.freeze(CourseAPI);

export default CourseAPI;
