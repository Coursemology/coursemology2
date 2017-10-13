import React from 'react';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import shallowUntil from 'utils/shallowUntil';
import MockAdapter from 'axios-mock-adapter';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CourseAPI from 'api/course';
import store from 'course/assessment/submission/store';
import ScribingView from 'course/assessment/submission/containers/ScribingView';
import ScribingToolbar from 'course/assessment/submission/components/ScribingView/ScribingToolbar';
import { setColoringToolColor } from '../../../actions/scribing';
import actionTypes, { scribingTools, scribingToolColor, scribingToolThickness,
      scribingToolLineStyle, scribingPopoverTypes } from '../../../constants';

const client = CourseAPI.assessment.answer.scribing.getClient();
const mock = new MockAdapter(client);

const assessmentId = 1;
const submissionId = 2;
const answerId = 3;

const mockSubmission = {
  submission: {
    attemptedAt: '2017-05-11T15:38:11.000+08:00',
    basePoints: 1000,
    graderView: true,
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

function initializeToolColor() {
  const colors = {};
  Object.values(scribingToolColor).forEach(toolType =>
   (colors[toolType] = 'rgba(0,0,0,1)')
  );
  return colors;
}

function initializeToolThickness() {
  const thickness = {};
  Object.values(scribingToolThickness).forEach(toolType =>
   (thickness[toolType] = 1)
  );
  return thickness;
}

function initializeLineStyles() {
  const lineStyles = {};
  Object.values(scribingToolLineStyle).forEach(toolType =>
   (lineStyles[toolType] = 'solid')
  );
  return lineStyles;
}

const props = {
  answerId: 1,
  scribing: {
    answer: {
      scribbles: [],
      image_path: '',
      user_id: 1,
      answer_id: 1,
    },
    colors: initializeToolColor(),
    lineStyles: initializeLineStyles(),
    thickness: initializeToolThickness(),
    canvas: {},
    isCanvasLoaded: false,
    isLoading: false,
    isSaving: false,
    isSaved: false,
    hasError: false,
    selectedTool: scribingTools.SELECT,
  },
  setLayerDisplay: jest.fn(),
  setToolSelected: jest.fn(),
  setFontFamily: jest.fn(),
  setFontSize: jest.fn(),
  setLineStyleChip: jest.fn(),
  setColoringToolColor: jest.fn(),
  setToolThickness: jest.fn(),
  setSelectedShape: jest.fn(),
  setNoFill: jest.fn(),
  setDrawingMode: jest.fn(),
  setCanvasCursor: jest.fn(),
  setCanvasZoom: jest.fn(),
  setCanvasDirty: jest.fn(),
  setCanvasSave: jest.fn(),
  deleteCanvasObject: jest.fn(),
  setDisableObjectSelection: jest.fn(),
  setEnableObjectSelection: jest.fn(),
  setEnableTextSelection: jest.fn(),
};

// stub import function
jest.mock('course/assessment/submission/loaders/ScribingViewLoader', () => (() => Promise.resolve()));

beforeEach(() => {
  mock.reset();
  store.dispatch({
    type: actionTypes.FETCH_SUBMISSION_SUCCESS,
    payload: mockSubmission,
  });
});

describe('ScribingToolbar', () => {
  it('renders tool popovers', async () => {
    const scribingToolbar = shallowUntil(
      <ScribingToolbar {...props} />,
      {
        context: { intl, muiTheme }, // eslint-disable-line no-undef
        childContextTypes: {
          intl: intlShape,
          muiTheme: PropTypes.object,
        },
      },
      'ScribingToolbar'
    );

    scribingToolbar.setState({
      popovers: {
        [scribingPopoverTypes.TYPE]: true,
      },
    });
    scribingToolbar.update();
    expect(scribingToolbar.find('InjectIntl(TypePopover)').prop('open')).toEqual(true);
  });

  it('renders color pickers', async () => {
    const scribingToolbar = shallowUntil(
      <ScribingToolbar {...props} />,
      {
        context: { intl, muiTheme }, // eslint-disable-line no-undef
        childContextTypes: {
          intl: intlShape,
          muiTheme: PropTypes.object,
        },
      },
      'ScribingToolbar'
    );

    scribingToolbar.setState({
      colorDropdowns: {
        [scribingToolColor.TYPE]: true,
      },
    });
    scribingToolbar.update();
    expect(scribingToolbar.find('InjectIntl(TypePopover)').prop('colorPickerPopoverOpen')).toEqual(true);

    scribingToolbar.setState({
      colorDropdowns: {
        [scribingToolColor.TYPE]: false,
      },
    });
    scribingToolbar.update();
    expect(scribingToolbar.find('InjectIntl(TypePopover)').prop('colorPickerPopoverOpen')).toEqual(false);
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
