import MaterialsAPI from './Materials';
import MaterialFoldersAPI from './MaterialFolders';

const CourseAPI = {
  materials: new MaterialsAPI(),
  materialFolders: new MaterialFoldersAPI(),
};

Object.freeze(CourseAPI);

export default CourseAPI;
