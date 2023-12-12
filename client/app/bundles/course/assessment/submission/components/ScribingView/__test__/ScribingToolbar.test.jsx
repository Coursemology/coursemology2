import { createMockAdapter } from 'mocks/axiosMock';
import { dispatch } from 'store';
import { act, fireEvent, render } from 'test-utils';

import CourseAPI from 'api/course';
import ScribingToolbar from 'course/assessment/submission/components/ScribingView/ScribingToolbar';
import ScribingView from 'course/assessment/submission/containers/ScribingView';

import { setColoringToolColor } from '../../../actions/scribing';
import actionTypes, {
  scribingToolColor,
  scribingToolLineStyle,
  scribingTools,
  scribingToolThickness,
} from '../../../constants';

const client = CourseAPI.assessment.answer.scribing.client;
const mock = createMockAdapter(client);

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
    submitter: { id: 10, name: 'Jane' },
    workflowState: 'submitted',
  },
  assessment: {},
  annotations: [],
  posts: [],
  questions: [{ id: 1, type: 'Scribing', maximumGrade: 5 }],
  topics: [],
  answers: [
    {
      id: answerId,
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
    },
  ],
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
  Object.values(scribingToolColor).forEach((toolType) => {
    colors[toolType] = 'rgba(0,0,0,1)';
  });
  return colors;
}

function initializeToolThickness() {
  const thickness = {};
  Object.values(scribingToolThickness).forEach((toolType) => {
    thickness[toolType] = 1;
  });
  return thickness;
}

function initializeLineStyles() {
  const lineStyles = {};
  Object.values(scribingToolLineStyle).forEach((toolType) => {
    lineStyles[toolType] = 'solid';
  });
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
    canvasStates: [],
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
  setUndo: jest.fn(),
  setRedo: jest.fn(),
};

beforeEach(() => {
  mock.reset();

  dispatch({
    type: actionTypes.FETCH_SUBMISSION_SUCCESS,
    payload: mockSubmission,
  });
});

describe('ScribingToolbar', () => {
  it('renders tool popovers', async () => {
    const page = render(<ScribingToolbar {...props} />);
    expect(page.getAllByRole('button')).toHaveLength(20);
  });

  it('renders color pickers', async () => {
    const page = render(<ScribingToolbar {...props} />);

    const buttons = page.getAllByRole('button');
    fireEvent.click(buttons[2]);
    expect(page.getByText('Text')).toBeVisible();

    const colorPicker = page.getByLabelText('Color Picker');
    expect(colorPicker).toBeVisible();
    fireEvent.click(colorPicker);

    expect(page.getByLabelText('hex')).toBeVisible();
    expect(page.getByLabelText('r')).toBeVisible();
    expect(page.getByLabelText('g')).toBeVisible();
    expect(page.getByLabelText('b')).toBeVisible();
    expect(page.getByLabelText('a')).toBeVisible();
  });

  it('sets the color from the color picker', async () => {
    const url = `/courses/${global.courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`;
    const page = render(<ScribingView answerId={answerId} />, { at: [url] });

    const coloringTool = scribingToolColor.TYPE;
    const color = 'rgba(231,12,12,1)';

    await act(() =>
      dispatch(setColoringToolColor(answerId, coloringTool, color)),
    );

    const buttons = page.getAllByRole('button');
    fireEvent.click(buttons[2]);

    const colorPicker = page.getByLabelText('Color Picker');
    fireEvent.click(colorPicker);

    expect(page.getByLabelText('r')).toHaveValue('231');
    expect(page.getByLabelText('g')).toHaveValue('12');
    expect(page.getByLabelText('b')).toHaveValue('12');
    expect(page.getByLabelText('a')).toHaveValue('100');
  });
});
