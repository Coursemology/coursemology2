import produce from 'immer';
import { CoursesEntity } from 'types/course/courses';
import { createEntityStore, saveListToStore } from 'utilities/store';
import { CoursesActionType, CoursesState, SAVE_COURSES_LIST } from './types';

const initialState: CoursesState = {
  courses: createEntityStore(),
  permissions: { canCreate: false, requestSubmitted: null },
};

const reducer = produce((draft: CoursesState, action: CoursesActionType) => {
  switch (action.type) {
    case SAVE_COURSES_LIST: {
      const coursesList = action.coursesList;
      const entityList: CoursesEntity[] = coursesList.map((data) => ({
        ...data,
      }));
      saveListToStore(draft.courses, entityList);
      draft.permissions = action.coursesPermissions;
      break;
    }
    default: {
      break;
    }
  }
}, initialState);

export default reducer;
