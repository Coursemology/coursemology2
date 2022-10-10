/* eslint-disable import/prefer-default-export */
import CourseAPI from 'api/course';
import { VideoSubmissionListData } from 'types/course/videoSubmissions';

export const fetchVideoSubmissions = async (): Promise<
  VideoSubmissionListData[]
> => {
  const response = await CourseAPI.videoSubmissions.index();
  return response.data.videoSubmissions;
};
