import { VideoSubmissionListData } from 'types/course/videoSubmissions';

import CourseAPI from 'api/course';

export const fetchVideoSubmissions = async (): Promise<
  VideoSubmissionListData[]
> => {
  const response = await CourseAPI.videoSubmissions.index();
  return response.data.videoSubmissions;
};
