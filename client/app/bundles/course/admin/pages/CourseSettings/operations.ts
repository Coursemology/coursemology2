import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import {
  CourseInfo,
  CourseInfoPostData,
  TimeZones,
} from 'types/course/admin/course';

export const fetchCourseSettings = async (): Promise<CourseInfo> => {
  const response = await CourseAPI.admin.course.index();
  return response.data;
};

export const fetchTimeZones = async (): Promise<TimeZones> => {
  const response = await CourseAPI.admin.course.timeZones();
  return response.data;
};

export const updateCourseSettings = async (
  data: CourseInfo,
): Promise<CourseInfo> => {
  const adaptedData: CourseInfoPostData = {
    course: {
      title: data.title,
      description: data.description,
      published: data.published,
      enrollable: data.enrollable,
      start_at: data.startAt,
      end_at: data.endAt,
      gamified: data.gamified,
      show_personalized_timeline_features:
        data.showPersonalizedTimelineFeatures,
      default_timeline_algorithm: data.defaultTimelineAlgorithm,
      time_zone: data.timeZone,
      advance_start_at_duration_days: data.advanceStartAtDurationDays,
    },
  };

  try {
    const response = await CourseAPI.admin.course.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const updateCourseLogo = async (image: File): Promise<CourseInfo> => {
  try {
    const response = await CourseAPI.admin.course.updateLogo(image);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.errors.logo);

    throw error;
  }
};

export const deleteCourse = async (): Promise<void> => {
  try {
    await CourseAPI.admin.course.delete();
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
