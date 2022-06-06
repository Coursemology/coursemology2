import produce from 'immer';
import { CourseMiniEntity } from 'types/course/courses';
import { createEntityStore, saveListToStore } from 'utilities/store';
import { CoursesActionType, CoursesState, SAVE_COURSE_LIST } from './types';

const initialState: CoursesState = {
  courses: createEntityStore(),
  instanceUserRoleRequestId: null,
  permissions: { canCreate: false },
};

const reducer = produce((draft: CoursesState, action: CoursesActionType) => {
  switch (action.type) {
    case SAVE_COURSE_LIST: {
      const coursesList = action.coursesList;
      const entityList: CourseMiniEntity[] = coursesList.map((data) => ({
        ...data,
      }));
      saveListToStore(draft.courses, entityList);
      draft.permissions = action.coursesPermissions;
      draft.instanceUserRoleRequestId = action.instanceUserRoleRequestId;
      break;
    }
    default: {
      break;
    }
  }
}, initialState);

export default reducer;
