import {
  CourseData,
  CourseListData,
  CoursePermissions,
} from 'types/course/courses';
import {
  SAVE_COURSE_LIST,
  SAVE_COURSE,
  REMOVE_TODO,
  SUBMIT_ENROL,
  CANCEL_ENROL,
  SaveCoursesListAction,
  SaveCourseAction,
  RemoveTodoAction,
  SubmitEnrolAction,
  CancelEnrolAction,
} from './types';

export function saveCoursesList(
  coursesList: CourseListData[],
  instanceUserRoleRequestId: number,
  coursesPermissions: CoursePermissions,
): SaveCoursesListAction {
  return {
    type: SAVE_COURSE_LIST,
    coursesList,
    instanceUserRoleRequestId,
    coursesPermissions,
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
