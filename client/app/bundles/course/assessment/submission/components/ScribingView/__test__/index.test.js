import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import store from 'course/assessment/submission/store';
import ScribingView from 'course/assessment/submission/containers/ScribingView';
import { setCanvasLoaded } from '../../../actions/scribing';
import actionTypes from '../../../constants';

const assessmentId = 1;
const submissionId = 2;
const answerId = 3;

const mockSubmission = {
  submission: {
    attemptedAt: '2017-05-11T15:38:11.000+08:00',
    basePoints: 1000,
    canGrade: true,
    canUpdate: true,
    isCreator: false,
    late: false,
    maximumGrade: 70,
    pointsAwarded: null,
    submittedAt: '2017-05-11T17:02:17.000+08:00',
    submitter: 'Jane',
    workflowState: 'submitted',
  },
  assessment: {},
  annotations: [],
  posts: [],
  questions: [],
  topics: [],
  answers: [{
    fields: {
      id: answerId,
      questionId: 1,
    },
    grading: {
      grade: null,
      id: answerId,
    },
    questionId: 1,
    scribing_answer: {
      answer_id: 23,
      image_path: '/attachments/image1',
      scribbles: [],
      user_id: 10,
    },
  }],
};

describe('ScribingView', () => {
  it('renders canvas', async () => {
    store.dispatch({
      type: actionTypes.FETCH_SUBMISSION_SUCCESS,
      payload: mockSubmission,
    });
    const loaded = true;
    const canvas = {};
    store.dispatch(setCanvasLoaded(answerId, loaded, canvas));

    const editPage = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter
          initialEntries={[`/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`]}
        >
          <ScribingView answerId={answerId} />
        </MemoryRouter>
      </ProviderWrapper>
    );
    expect(editPage.find('canvas').length).toBe(1);
  });
});
