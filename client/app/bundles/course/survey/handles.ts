import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { DataHandle } from 'lib/hooks/router/dynamicNest';

const getSurveyTitle = async (surveyId: number): Promise<string> => {
  const { data } = await CourseAPI.survey.surveys.fetch(surveyId);
  return data.title;
};

const getResponseCreatorName = async (responseId: number): Promise<string> => {
  const { data } = await CourseAPI.survey.responses.fetch(responseId);
  return data.response.creator_name;
};

export const surveyHandle: DataHandle = (match) => {
  const surveyId = getIdFromUnknown(match.params?.surveyId);
  if (!surveyId) throw new Error(`Invalid survey id: ${surveyId}`);

  return { getData: () => getSurveyTitle(surveyId) };
};

export const surveyResponseHandle: DataHandle = (match) => {
  const responseId = getIdFromUnknown(match.params?.responseId);
  if (!responseId) throw new Error(`Invalid response id: ${responseId}`);

  return { getData: () => getResponseCreatorName(responseId) };
};
