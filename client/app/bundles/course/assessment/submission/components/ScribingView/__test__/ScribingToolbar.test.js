import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CourseAPI from 'api/course';
import store from 'course/assessment/submission/store';
import ScribingView from 'course/assessment/submission/containers/ScribingView';
import { openPopover, closePopover, openColorPicker, closeColorPicker,
         setColoringToolColor } from '../../../actions/scribing';
import actionTypes, { scribingToolColor, scribingPopoverTypes } from '../../../constants';

const client = CourseAPI.assessment.answer.scribing.getClient();
const mock = new MockAdapter(client);

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

const mockAnchor = {
  getBoundingClientRect: jest.fn(),
};
mockAnchor.getBoundingClientRect.mockReturnValue({
  top: 0,
  left: 0,
  width: 100,
  height: 100,
});

beforeEach(() => {
  mock.reset();
  store.dispatch({
    type: actionTypes.FETCH_SUBMISSION_SUCCESS,
    payload: mockSubmission,
  });
});

describe('ScribingToolbar', () => {
  it('renders tool popovers', async () => {
    const editPage = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter
          initialEntries={[`/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`]}
        >
          <ScribingView answerId={answerId} />
        </MemoryRouter>
      </ProviderWrapper>
    );

    const popoverType = scribingPopoverTypes.DRAW;
    store.dispatch(openPopover(answerId, popoverType, mockAnchor));
    expect(editPage.find('DrawPopover').prop('open')).toEqual(true);

    store.dispatch(closePopover(answerId, popoverType));
    expect(editPage.find('DrawPopover').prop('open')).toEqual(false);
  });

  it('renders color pickers', async () => {
    const editPage = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter
          initialEntries={[`/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`]}
        >
          <ScribingView answerId={answerId} />
        </MemoryRouter>
      </ProviderWrapper>
    );

    const toolType = scribingToolColor.TYPE;
    store.dispatch(openColorPicker(answerId, toolType, mockAnchor));
    expect(editPage.find('TypePopover').prop('colorPickerPopoverOpen')).toEqual(true);

    store.dispatch(closeColorPicker(answerId, toolType));
    expect(editPage.find('TypePopover').prop('colorPickerPopoverOpen')).toEqual(false);
  });

  it('sets the color from the color picker', async () => {
    const editPage = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter
          initialEntries={[`/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`]}
        >
          <ScribingView answerId={answerId} />
        </MemoryRouter>
      </ProviderWrapper>
    );

    const coloringTool = scribingToolColor.TYPE;
    const color = 'rgba(231,12,12,1)';
    store.dispatch(setColoringToolColor(answerId, coloringTool, color));
    expect(editPage.find('TypePopover').prop('colorPickerColor')).toEqual(color);
    expect(editPage.find('ToolDropdown').first().prop('colorBar')).toEqual(color);
  });
});
