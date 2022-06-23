import CourseAPI from 'api/course';
import { AxiosResponse } from 'axios';
import { NewCourseFormData } from 'types/course/courses';
import { Operation } from 'types/store';
import * as actions from './actions';
import {
  SaveCourseAction,
  SubmitEnrolAction,
  CancelEnrolAction,
} from './types';

const formatAttributes = (data: NewCourseFormData): FormData => {
  const payload = new FormData();

  ['title', 'description'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`course[${field}]`, data[field]);
    }
  });
  return payload;
};

export function fetchCourses(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.courses
      .index()
      .then((response) => {
        const data = response.data;

        dispatch(
          actions.saveCoursesList(
            data.courses,
            data.instanceUserRoleRequestId,
            data.permissions,
          ),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function loadCourse(courseId: number): Operation<SaveCourseAction> {
  return async (dispatch) =>
    CourseAPI.courses
      .fetch(courseId)
      .then((response) => {
        return dispatch(actions.saveCourse(response.data.course));
      })
      .catch((error) => {
        throw error;
      });
}

export function createCourse(data: NewCourseFormData): Operation<
  AxiosResponse<{
    id: number;
    title: string;
  }>
> {
  const attributes = formatAttributes(data);
  return async (_) => CourseAPI.courses.create(attributes);
}

export function removeTodo(
  ignoreLink: string,
  courseId: number,
  todoType: 'assessments' | 'videos' | 'surveys',
  todoId: number,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.courses
      .removeTodo(ignoreLink)
      .then(() => {
        dispatch(actions.removeTodo(courseId, todoType, todoId));
      })
      .catch((error) => {
        throw error;
      });
}

export function sendNewRegistrationCode(
  registrationLink: string,
  myData: FormData,
): Operation<AxiosResponse<void>> {
  return async (_) =>
    CourseAPI.courses.sendNewRegistrationCode(registrationLink, myData);
}

export function submitEnrolRequest(
  link: string,
  courseId: number,
): Operation<SubmitEnrolAction> {
  return async (dispatch) =>
    CourseAPI.courses
      .submitEnrolRequest(link)
      .then((response) => {
        return dispatch(actions.submitEnrolRequest(courseId, response.data.id));
      })
      .catch((error) => {
        throw error;
      });
}

export function cancelEnrolRequest(
  link: string,
  courseId: number,
): Operation<CancelEnrolAction> {
  return async (dispatch) =>
    CourseAPI.courses
      .cancelEnrolRequest(link)
      .then(() => {
        return dispatch(actions.cancelEnrolRequest(courseId));
      })
      .catch((error) => {
        throw error;
      });
}
