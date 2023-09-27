import { AllExperiencePointsRecords } from 'types/course/experiencePointsRecords';

import CourseAPI from 'api/course';

export type ExperiencePointsData = Promise<AllExperiencePointsRecords>;

export const fetchAllExperiencePointsRecord = async (
  pageNum: number = 1,
): ExperiencePointsData => {
  const response = await CourseAPI.experiencePointsRecord.indexAll(pageNum);
  return response.data;
};
