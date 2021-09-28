import React from 'react';
import 'brace';
import { mount } from 'enzyme';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import store from 'course/assessment/submission/store';
import actionTypes, { questionTypes, formNames } from '../../../constants';
import SubmissionEditIndex from '../index';

const assessmentId = 1;
const submissionId = 2;
const answerId = 3;

const errorSubmission = {
  submission: {
    attemptedAt: '2017-05-11T15:38:11.000+08:00',
    basePoints: 1000,
    showPublicTestCasesOutput: true,
    canUpdate: true,
    canGrade: false,
    isCreator: false,
    late: false,
    maximumGrade: 70,
    pointsAwarded: null,
    submittedAt: '2017-05-11T17:02:17.000+08:00',
    submitter: 'Jane',
    workflowState: 'submitted',
    maxStep: 5,
  },
  assessment: {
    gamified: true,
    graderView: true,
    autograded: true,
    allowPartialSubmission: false,
    files: [],
    questionIds: [1],
    skippable: true,
  },
  annotations: [],
  posts: [],
  questions: [
    {
      id: 1,
      displayTitle: 'Audio Question',
      description: 'Audio Question description',
      type: questionTypes.VoiceResponse,
      topicId: 1,
      maximumGrade: 70,
    },
  ],
  topics: [
    {
      id: 1,
      postIds: [],
      questionId: 1,
      submissionQuestionId: 1,
    },
  ],
  answers: [
    {
      fields: {
        id: answerId,
        questionId: 1,
        file: {},
      },
      grading: {
        grade: null,
        id: answerId,
      },
      questionId: 1,
    },
  ],
  history: {
    questions: [
      {
        id: 1,
        answerIds: [],
      },
    ],
  },
};

const successSubmission = {
  submission: {
    attemptedAt: '2017-05-11T15:38:11.000+08:00',
    basePoints: 1000,
    showPublicTestCasesOutput: true,
    canUpdate: true,
    canGrade: false,
    isCreator: false,
    late: false,
    maximumGrade: 70,
    pointsAwarded: null,
    submittedAt: '2017-05-11T17:02:17.000+08:00',
    submitter: 'Jane',
    workflowState: 'submitted',
    maxStep: 5,
  },
  assessment: {
    gamified: true,
    graderView: true,
    autograded: true,
    allowPartialSubmission: false,
    files: [],
    questionIds: [1],
    skippable: true,
  },
  annotations: [],
  posts: [],
  questions: [
    {
      id: 1,
      displayTitle: 'Audio Question',
      description: 'Audio Question description',
      type: questionTypes.VoiceResponse,
      topicId: 1,
      maximumGrade: 70,
    },
  ],
  topics: [
    {
      id: 1,
      postIds: [],
      questionId: 1,
      submissionQuestionId: 1,
    },
  ],
  answers: [
    {
      fields: {
        id: answerId,
        questionId: 1,
        file: { url: 'http://test.org/file.wav', name: 'file.wav' },
      },
      grading: {
        grade: null,
        id: answerId,
      },
      questionId: 1,
    },
  ],
  history: {
    questions: [
      {
        id: 1,
        answerIds: [],
      },
    ],
  },
};

// stub import function
jest.mock(
  'course/assessment/submission/loaders/ScribingViewLoader',
  () => () => Promise.resolve(),
);

describe('SubmissionEditIndex', () => {
  it('render submission with errors', async () => {
    store.dispatch({
      type: actionTypes.FETCH_SUBMISSION_SUCCESS,
      payload: errorSubmission,
    });

    mount(
      <ProviderWrapper store={store}>
        <SubmissionEditIndex
          match={{
            params: {
              courseId,
              assessmentId: `${assessmentId}`,
              submissionId: `${submissionId}`,
            },
          }}
        />
      </ProviderWrapper>,
    );

    const syncErrors = store.getState().form[formNames.SUBMISSION].syncErrors;
    expect(
      Object.keys((syncErrors || {})[answerId] || {}).length !== 0,
    ).toEqual(true);
  });

  it('render submission without errors', async () => {
    store.dispatch({
      type: actionTypes.FETCH_SUBMISSION_SUCCESS,
      payload: successSubmission,
    });

    mount(
      <ProviderWrapper store={store}>
        <SubmissionEditIndex
          match={{
            params: {
              courseId,
              assessmentId: `${assessmentId}`,
              submissionId: `${submissionId}`,
            },
          }}
        />
      </ProviderWrapper>,
    );

    const syncErrors = store.getState().form[formNames.SUBMISSION].syncErrors;
    expect(Object.keys((syncErrors || {}).answerId || {}).length === 0).toEqual(
      true,
    );
  });
});
