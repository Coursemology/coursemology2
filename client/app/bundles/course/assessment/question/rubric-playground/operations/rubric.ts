import {
  RubricData,
} from 'types/course/rubrics';

import CourseAPI from 'api/course';

export const fetchQuestionRubrics = async (): Promise<RubricData[]> => {
  const response = await CourseAPI.assessment.question.rubrics.index();
  return response.data;
};
