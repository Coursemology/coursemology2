import { waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { dispatch } from 'store';

import CourseAPI from 'api/course';
import history from 'lib/history';

import { createScribingQuestion, updateScribingQuestion } from '../operations';

// Mock axios
const client = CourseAPI.assessment.question.scribing.client;
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
  jest.spyOn(history, 'push').mockImplementation();
});

const assessmentId = '2';
const scribingId = '3';

const createResponseUrl = `/courses/${global.courseId}/assessments/${assessmentId}/question/scribing`;
const updateResponseUrl = `/courses/${global.courseId}/assessments/${assessmentId}/question/scribing/${scribingId}`;
const redirectUrl = `/courses/${global.courseId}/assessments/${assessmentId}`;
const newUrl = `/courses/${global.courseId}/assessments/${assessmentId}/question/scribing/${scribingId}/new`;
const editUrl = `/courses/${global.courseId}/assessments/${assessmentId}/question/scribing/${scribingId}/edit`;

const mockFields = {
  title: 'Scribing Exercise',
  maximum_grade: 10,
  skill_ids: [],
};

const processedMockFields = {
  question_scribing: {
    title: 'Scribing Exercise',
    maximum_grade: 10,
    question_assessment: { skill_ids: [''] },
  },
};

describe('createScribingQuestion', () => {
  const spy = jest.spyOn(CourseAPI.assessment.question.scribing, 'create');
  window.history.pushState({}, '', newUrl);

  it('redirects after creation of new scribing question', async () => {
    mock
      .onPost(createResponseUrl)
      .reply(200, { message: 'The scribing question was created.' });

    dispatch(createScribingQuestion(mockFields, '', jest.fn()));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(processedMockFields);
      expect(history.push).toHaveBeenCalledWith(redirectUrl);
    });
  });
});

describe('updateScribingQuestion', () => {
  const spy = jest.spyOn(CourseAPI.assessment.question.scribing, 'update');
  window.history.pushState({}, '', editUrl);

  it('redirects after updating of scribing question', async () => {
    mock
      .onPatch(updateResponseUrl)
      .reply(200, { message: 'The scribing question was created.' });

    dispatch(updateScribingQuestion(scribingId, mockFields, '', jest.fn()));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(scribingId, processedMockFields);
      expect(history.push).toHaveBeenCalledWith(redirectUrl);
    });
  });
});
