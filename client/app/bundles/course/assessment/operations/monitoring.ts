import { MonitoringRequestData } from 'types/course/assessment/monitoring';

import CourseAPI from 'api/course';

export const fetchMonitoringData = async (): Promise<MonitoringRequestData> => {
  const response = await CourseAPI.assessment.assessments.fetchMonitoringData();
  return response.data;
};
