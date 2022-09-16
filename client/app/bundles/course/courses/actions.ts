import {
  CourseData,
  CourseListData,
  CoursePermissions,
} from 'types/course/courses';
import { RoleRequestBasicListData } from 'types/system/instance/roleRequests';
import {
  SAVE_COURSE_LIST,
  SAVE_COURSE,
  REMOVE_TODO,
  SUBMIT_ENROL,
  CANCEL_ENROL,
  SAVE_INSTANCE_ROLE_REQUEST,
  SaveCourseListAction,
  SaveCourseAction,
  RemoveTodoAction,
  SubmitEnrolAction,
  CancelEnrolAction,
  SaveInstanceRoleRequest,
} from './types';

export function saveCourseList(
  courseList: CourseListData[],
  coursesPermissions: CoursePermissions,
  instanceUserRoleRequest?: RoleRequestBasicListData,
): SaveCourseListAction {
  return {
    type: SAVE_COURSE_LIST,
    courseList,
    instanceUserRoleRequest,
    coursesPermissions,
  };
}

export function saveInstanceRoleRequest(
  instanceUserRoleRequest: RoleRequestBasicListData,
): SaveInstanceRoleRequest {
  return {
    type: SAVE_INSTANCE_ROLE_REQUEST,
    instanceUserRoleRequest,
  };
}

export function saveCourse(course: CourseData): SaveCourseAction {
  return {
    type: SAVE_COURSE,
    course,
  };
}

// Named "remove" as the todo is not actually deleted
export function removeTodo(
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
}

export function submitEnrolRequest(
  courseId: number,
  id: number,
): SubmitEnrolAction {
  return {
    type: SUBMIT_ENROL,
    courseId,
    id,
  };
}

export function cancelEnrolRequest(courseId: number): CancelEnrolAction {
  return {
    type: CANCEL_ENROL,
    courseId,
  };
}
