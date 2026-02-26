import { createMockAdapter } from 'mocks/axiosMock';
import { dispatch } from 'store';
import { act, fireEvent, render, waitFor } from 'test-utils';
import { QuestionType } from 'types/course/assessment/question';
import { ScribingAnswerData } from 'types/course/assessment/submission/answer/scribing';

import CourseAPI from 'api/course';
import {
  ScribingCanvasRef,
  ScribingLayer,
} from 'course/assessment/submission/components/ScribingView/ScribingCanvas';
import ScribingToolbar from 'course/assessment/submission/components/ScribingView/ScribingToolbar';
import { scribingActions } from 'course/assessment/submission/reducers/scribing';

const client = CourseAPI.assessment.answer.scribing.client;
const mock = createMockAdapter(client);

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
        image_url: '/attachments/image1',
        scribbles: [],
        user_id: 10,
      },
      questionType: QuestionType.Scribing,
      createdAt: new Date(1494522137000).toISOString(),
      clientVersion: 1494522137000,
    } as ScribingAnswerData,
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

const mockLayers: ScribingLayer[] = [
  {
    creator_id: 10,
    creator_name: 'Jane',
    isDisplayed: true,
    content: '',
    scribbleGroup: {} as ScribingLayer['scribbleGroup'],
  },
  {
    creator_id: 11,
    creator_name: 'John',
    isDisplayed: false,
    content: '',
    scribbleGroup: {} as ScribingLayer['scribbleGroup'],
  },
];

const buildCanvasRef = (
  overrides: Partial<ScribingCanvasRef> = {},
): ScribingCanvasRef => ({
  getActiveObject: jest.fn().mockReturnValue(undefined),
  getCanvasWidth: jest.fn().mockReturnValue(800),
  getLayers: jest.fn().mockReturnValue([]),
  setLayerDisplay: jest.fn(),
  onSelectionChange: jest.fn().mockReturnValue(jest.fn()),
  ...overrides,
});

const props = {
  answerId,
  canvasRef: buildCanvasRef(),
};

beforeEach(async () => {
  mock.reset();

  await act(() =>
    dispatch(scribingActions.initialize({ answers: mockSubmission.answers })),
  );
});

describe('ScribingToolbar', () => {
  it('renders tool popovers', async () => {
    // at least one layer needed to show the layers component
    const canvasRef = buildCanvasRef({
      getLayers: jest.fn().mockReturnValue(mockLayers),
    });
    const page = render(
      <ScribingToolbar answerId={answerId} canvasRef={canvasRef} />,
    );
    expect(await page.findAllByRole('button')).toHaveLength(20);
  });

  it('renders color pickers', async () => {
    const page = render(<ScribingToolbar {...props} />);

    const buttons = await page.findAllByRole('button');
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

  it('does not render without a canvasRef', () => {
    const page = render(
      <ScribingToolbar answerId={answerId} canvasRef={null} />,
    );
    expect(page.queryByRole('button')).toBeNull();
  });

  it('subscribes to selection changes on mount and unsubscribes on unmount', async () => {
    const unsubscribe = jest.fn();
    const canvasRef = buildCanvasRef({
      onSelectionChange: jest.fn().mockReturnValue(unsubscribe),
    });

    const { unmount } = render(
      <ScribingToolbar answerId={answerId} canvasRef={canvasRef} />,
    );
    await waitFor(() => expect(canvasRef.onSelectionChange).toHaveBeenCalled());

    unmount();
    // Each subscription is balanced by an unsubscription (StrictMode may double-invoke)
    expect(unsubscribe.mock.calls).toHaveLength(
      (canvasRef.onSelectionChange as jest.Mock).mock.calls.length,
    );
  });

  it('re-renders and re-reads active object when selection changes', async () => {
    let selectionCallback: (() => void) | null = null;
    const canvasRef = buildCanvasRef({
      onSelectionChange: jest.fn().mockImplementation((cb: () => void) => {
        selectionCallback = cb;
        return jest.fn();
      }),
    });
    render(<ScribingToolbar answerId={answerId} canvasRef={canvasRef} />);
    await waitFor(() => expect(selectionCallback).not.toBeNull());

    await act(async () => {
      selectionCallback!();
    });
    expect(canvasRef.getActiveObject).toHaveBeenCalled();
  });

  it('renders layer names from canvasRef.getLayers()', async () => {
    const canvasRef = buildCanvasRef({
      getLayers: jest.fn().mockReturnValue(mockLayers),
    });
    const page = render(
      <ScribingToolbar answerId={answerId} canvasRef={canvasRef} />,
    );

    // The first layer name is shown on the layers button without opening the popover
    expect(await page.findByText('Jane')).toBeVisible();
  });

  it('calls setLayerDisplay when a layer is toggled', async () => {
    const canvasRef = buildCanvasRef({
      getLayers: jest.fn().mockReturnValue(mockLayers),
    });
    const page = render(
      <ScribingToolbar answerId={answerId} canvasRef={canvasRef} />,
    );

    // Open the layers popover
    const layersButton = await page.findByText('Jane');
    fireEvent.click(layersButton);

    // Click the second layer (John) to toggle it
    fireEvent.click(page.getByText('John'));
    expect(canvasRef.setLayerDisplay).toHaveBeenCalledWith(11, true);
  });

  it('sets the color from the color picker', async () => {
    const canvasRef = buildCanvasRef({
      getLayers: jest.fn().mockReturnValue(mockLayers),
    });
    const page = render(
      <ScribingToolbar answerId={answerId} canvasRef={canvasRef} />,
    );

    const coloringTool = 'TYPE';
    const color = 'rgba(231,12,12,1)';

    await act(() =>
      dispatch(
        scribingActions.setColoringToolColor({ answerId, coloringTool, color }),
      ),
    );

    const buttons = await page.findAllByRole('button');
    fireEvent.click(buttons[2]);

    const colorPicker = page.getByLabelText('Color Picker');
    fireEvent.click(colorPicker);

    expect(page.getByLabelText('r')).toHaveValue('231');
    expect(page.getByLabelText('g')).toHaveValue('12');
    expect(page.getByLabelText('b')).toHaveValue('12');
    expect(page.getByLabelText('a')).toHaveValue('100');
  });
});
