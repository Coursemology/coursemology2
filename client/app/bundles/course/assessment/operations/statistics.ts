import { Operation } from 'store';
import { QuestionType } from 'types/course/assessment/question';
import {
  AncestorAssessmentStats,
  QuestionAnswerDetails,
} from 'types/course/statistics/assessmentStatistics';

import CourseAPI from 'api/course';

import { statisticsActions as actions } from '../reducers/statistics';

export function fetchAssessmentStatistics(assessmentId: number): Operation {
  return async (dispatch) => {
    CourseAPI.statistics.assessment
      .fetchMainStatistics(assessmentId)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.initialize({
            assessment: data.assessment,
            allStudents: data.allStudents,
            submissions: data.submissions,
            ancestors: data.ancestors,
            isLoading: false,
          }),
        );
      });
  };
}

export const fetchAncestorStatistics = async (
  ancestorId: number,
): Promise<AncestorAssessmentStats> => {
  const response =
    await CourseAPI.statistics.assessment.fetchAncestorStatistics(ancestorId);

  return response.data;
};

export const fetchQuestionAnswerDetails = async (
  answerId: number,
): Promise<QuestionAnswerDetails<keyof typeof QuestionType>> => {
  const response =
    await CourseAPI.statistics.answer.fetchQuestionAnswerDetails(answerId);

  return response.data;
};
