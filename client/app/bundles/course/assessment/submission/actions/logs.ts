import { LogInfo } from 'types/course/assessment/submission/logs';

import CourseAPI from 'api/course';
import { redirectToNotFoundIfMissing } from 'api/ErrorHandling';

const fetchLogs = async (): Promise<LogInfo> => {
  try {
    const response = await CourseAPI.assessment.logs.index();
    return response.data;
  } catch (error) {
    // As with the attempt page, an ID that matches no submission in this assessment 404s
    // from the backend, and there are no logs to show for it.
    redirectToNotFoundIfMissing(error);
    throw error;
  }
};

export default fetchLogs;
