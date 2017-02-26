import AssessmentsAPI from './Assessments';
import LecturesAPI from './Lectures';
import MaterialsAPI from './Materials';
import MaterialFoldersAPI from './MaterialFolders';
import SurveyAPI from './Survey';

const CourseAPI = {
  assessments: new AssessmentsAPI(),
  lectures: new LecturesAPI(),
  materials: new MaterialsAPI(),
  materialFolders: new MaterialFoldersAPI(),
  survey: SurveyAPI,
};

Object.freeze(CourseAPI);

export default CourseAPI;
