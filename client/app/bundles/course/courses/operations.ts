import CourseAPI from 'api/course';
import { AxiosResponse } from 'axios';
import { NewCourseFormData } from 'types/course/courses';
import { Operation } from 'types/store';
import * as actions from './actions';

export function fetchCourses(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.courses
      .index()
      .then((response) => {
        const data = response.data;

        dispatch(actions.saveCoursesList(data.courses, data.permissions));
      })
      .catch((error) => {
        throw error;
      });
}

const formatAttributes = (data: NewCourseFormData): FormData => {
  const payload = new FormData();

  ['title', 'description'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`course[${field}]`, data[field]);
    }
  });
  return payload;
};

export function createCourse(data: NewCourseFormData): Operation<
  AxiosResponse<{
    id: number;
    title: string;
  }>
> {
  const attributes = formatAttributes(data);
  return async (_) => CourseAPI.courses.create(attributes);
}
