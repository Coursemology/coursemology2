import { AxiosError } from 'axios';
import {
  VoiceResponseData,
  VoiceResponseFormData,
  VoiceResponsePostData,
} from 'types/course/assessment/question/voice-responses';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';

export const fetchNewVoiceResponse = async (): Promise<
  VoiceResponseFormData<'new'>
> => {
  const response =
    await CourseAPI.assessment.question.voiceResponse.fetchNewVoiceResponse();
  return response.data;
};

export const fetchEditVoiceResponse = async (
  id: number,
): Promise<VoiceResponseFormData<'edit'>> => {
  const response =
    await CourseAPI.assessment.question.voiceResponse.fetchEditVoiceResponse(
      id,
    );
  return response.data;
};

const adaptPostData = (data: VoiceResponseData): VoiceResponsePostData => ({
  question_voice_response: {
    title: data.question.title,
    description: data.question.description,
    staff_only_comments: data.question.staffOnlyComments,
    maximum_grade: data.question.maximumGrade,
    question_assessment: { skill_ids: data.question.skillIds },
  },
});

export const createVoiceQuestion = async (
  data: VoiceResponseData,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response =
      await CourseAPI.assessment.question.voiceResponse.create(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const updateVoiceQuestion = async (
  id: number,
  data: VoiceResponseData,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response = await CourseAPI.assessment.question.voiceResponse.update(
      id,
      adaptedData,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
