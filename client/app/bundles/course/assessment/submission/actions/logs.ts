import { LogInfo } from 'types/course/assessment/submission/logs';

import CourseAPI from 'api/course';

const fetchLogs = async (): Promise<LogInfo> => {
  const response = await CourseAPI.assessment.logs.index();
  return response.data;
};

export default fetchLogs;
