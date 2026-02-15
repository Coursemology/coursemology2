import { produce } from 'immer';
import {
  CourseData,
  CourseListData,
  CoursePermissions,
} from 'types/course/courses';
import { RoleRequestBasicListData } from 'types/system/instance/roleRequests';
import {
  createEntityStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  CANCEL_ENROL,
  CancelEnrolAction,
  CoursesActionType,
  CoursesState,
  REMOVE_TODO,
  RemoveTodoAction,
  SAVE_COURSE,
  SAVE_COURSE_LIST,
  SAVE_INSTANCE_ROLE_REQUEST,
  SaveCourseAction,
  SaveCourseListAction,
  SaveInstanceRoleRequest,
  SUBMIT_ENROL,
  SubmitEnrolAction,
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

export const actions = {
  saveCourseList: (
    courseList: CourseListData[],
    coursesPermissions: CoursePermissions,
    instanceUserRoleRequest?: RoleRequestBasicListData,
  ): SaveCourseListAction => {
    return {
      type: SAVE_COURSE_LIST,
      courseList,
      instanceUserRoleRequest,
      coursesPermissions,
    };
  },
  saveInstanceRoleRequest: (
    instanceUserRoleRequest: RoleRequestBasicListData,
  ): SaveInstanceRoleRequest => {
    return {
      type: SAVE_INSTANCE_ROLE_REQUEST,
      instanceUserRoleRequest,
    };
  },
  saveCourse: (course: CourseData): SaveCourseAction => {
    return {
      type: SAVE_COURSE,
      course,
    };
  },
  removeTodo(
    courseId: number,
    todoType: 'assessments' | 'videos' | 'surveys',
    todoId: number,
  ): RemoveTodoAction {
    return {
      type: REMOVE_TODO,
      courseId,
      todoType,
      todoId,
    };
  },
  submitEnrolRequest(courseId: number, id: number, status: string): SubmitEnrolAction {
    return {
      type: SUBMIT_ENROL,
      courseId,
      id,
      status,
    };
  },
  cancelEnrolRequest(courseId: number): CancelEnrolAction {
    return {
      type: CANCEL_ENROL,
      courseId,
    };
  },
};

export default reducer;
