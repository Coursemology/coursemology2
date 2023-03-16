import produce from 'immer';
import {
  createEntityStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  CANCEL_ENROL,
  CoursesActionType,
  CoursesState,
  REMOVE_TODO,
  SAVE_COURSE,
  SAVE_COURSE_LIST,
  SAVE_INSTANCE_ROLE_REQUEST,
  SUBMIT_ENROL,
} from './types';

const initialState: CoursesState = {
  courses: createEntityStore(),
  permissions: { canCreate: false, isCurrentUser: false },
  instanceUserRoleRequest: undefined,
};

const reducer = produce((draft: CoursesState, action: CoursesActionType) => {
  switch (action.type) {
    case SAVE_COURSE_LIST: {
      const courseList = action.courseList;
      const entityList = courseList.map((data) => ({
        ...data,
      }));
      saveListToStore(draft.courses, entityList);
      draft.permissions = action.coursesPermissions;
      draft.instanceUserRoleRequest = action.instanceUserRoleRequest;
      break;
    }

    case SAVE_COURSE: {
      const courseData = action.course;
      const courseEntity = { ...courseData };
      saveEntityToStore(draft.courses, courseEntity);
      break;
    }

    case REMOVE_TODO: {
      const courseId = action.courseId;
      const todoType = action.todoType;
      const todoId = action.todoId;
      const course = draft.courses.byId[courseId];
      // Inefficient: filter is O(n)
      if (course) {
        // eslint-disable-next-line sonarjs/no-nested-switch
        switch (todoType) {
          case 'assessments':
            if (course.assessmentTodos) {
              course.assessmentTodos = course.assessmentTodos.filter(
                (todo) => todo.id !== todoId,
              );
            }
            break;
          case 'videos':
            if (course.videoTodos) {
              course.videoTodos = course.videoTodos.filter(
                (todo) => todo.id !== todoId,
              );
            }
            break;
          case 'surveys':
            if (course.surveyTodos) {
              course.surveyTodos = course.surveyTodos.filter(
                (todo) => todo.id !== todoId,
              );
            }
            break;
          default:
            break;
        }
      }
      break;
    }

    case SUBMIT_ENROL: {
      const course = draft.courses.byId[action.courseId];
      if (course?.registrationInfo) {
        course.registrationInfo.enrolRequestId = action.id;
      }
      break;
    }

    case CANCEL_ENROL: {
      const course = draft.courses.byId[action.courseId];
      if (course?.registrationInfo) {
        course.registrationInfo.enrolRequestId = null;
      }
      break;
    }

    case SAVE_INSTANCE_ROLE_REQUEST: {
      draft.instanceUserRoleRequest = action.instanceUserRoleRequest;
      break;
    }

    default: {
      break;
    }
  }
}, initialState);

export default reducer;
