import { AxiosError } from 'axios';
import {
  VoiceData,
  VoiceFormData,
  VoicePostData,
} from 'types/course/assessment/question/voice-responses';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';

export const fetchNewVoiceQuestion = async (): Promise<
  VoiceFormData<'new'>
> => {
  const response = await CourseAPI.assessment.question.voice.fetchNewVoice();
  return response.data;
};

export const fetchEditVoiceQuestion = async (
  id: number,
): Promise<VoiceFormData<'edit'>> => {
  const response = await CourseAPI.assessment.question.voice.fetchEdit(id);
  return response.data;
};

const adaptPostData = (data: VoiceData): VoicePostData => ({
  question_voice_response: {
    title: data.question.title,
    description: data.question.description,
    staff_only_comments: data.question.staffOnlyComments,
    maximum_grade: data.question.maximumGrade,
    question_assessment: { skill_ids: data.question.skillIds },
  },
});

export const createVoiceQuestion = async (
  data: VoiceData,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response = await CourseAPI.assessment.question.voice.create(
      adaptedData,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const updateVoiceQuestion = async (
  id: number,
  data: VoiceData,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response = await CourseAPI.assessment.question.voice.update(
      id,
      adaptedData,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
