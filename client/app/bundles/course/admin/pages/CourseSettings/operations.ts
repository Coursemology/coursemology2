import { AxiosError } from 'axios';
import {
  CourseInfo,
  CourseInfoPostData,
  TimeOffset,
  TimeZones,
} from 'types/course/admin/course';

import CourseAPI from 'api/course';

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
  timeOffset?: TimeOffset,
): Promise<CourseInfo> => {
  const adaptedData: CourseInfoPostData = {
    course: {
      title: data.title,
      description: data.description,
      published: data.published,
      enrollable: data.enrollable,
      enrol_auto_approve: data.enrolAutoApprove,
      start_at: data.startAt,
      end_at: data.endAt,
      gamified: data.gamified,
      show_personalized_timeline_features:
        data.showPersonalizedTimelineFeatures,
      default_timeline_algorithm: data.defaultTimelineAlgorithm,
      time_zone: data.timeZone,
      advance_start_at_duration_days: data.advanceStartAtDurationDays,
      time_offset: timeOffset,
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

export const updateCourseLogo = async (file: File): Promise<CourseInfo> => {
  try {
    const response = await CourseAPI.admin.course.updateLogo(file);
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
