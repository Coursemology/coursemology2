import AssessmentsAPI from './Assessments';
import MaterialsAPI from './Materials';
import MaterialFoldersAPI from './MaterialFolders';

const CourseAPI = {
  assessments: new AssessmentsAPI(),
  materials: new MaterialsAPI(),
  materialFolders: new MaterialFoldersAPI(),
};

Object.freeze(CourseAPI);

export default CourseAPI;
