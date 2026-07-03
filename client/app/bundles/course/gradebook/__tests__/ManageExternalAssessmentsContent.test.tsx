import type { DropResult } from '@hello-pangea/dnd';
import userEvent from '@testing-library/user-event';
import type { AppDispatch } from 'store';
import { render, screen, waitFor } from 'test-utils';

import ManageExternalAssessmentsContent, {
  handleDragEnd,
  moveItem,
} from '../components/manage/ManageExternalAssessmentsContent';
import { reorderExternalAssessments } from '../operations';

const dropResult = (from: number, to: number | null): DropResult =>
  ({
    draggableId: 'x',
    type: 'DEFAULT',
    mode: 'FLUID',
    reason: 'DROP',
    combine: null,
    source: { index: from, droppableId: 'external-assessments' },
    destination:
      to === null ? null : { index: to, droppableId: 'external-assessments' },
  }) as DropResult;

jest.mock('../operations', () => ({
  __esModule: true,
  ...jest.requireActual('../operations'),
  reorderExternalAssessments: jest.fn(
    () => (): Promise<void> => Promise.resolve(),
  ),
}));

const preloadedState = {
  gradebook: {
    categories: [],
    students: [],
    submissions: [],
    gamificationEnabled: false,
    weightedViewEnabled: false,
    canManageWeights: true,
    courseMaxLevel: 0,
    levelContribution: {
      enabled: false,
      formula: '',
      weight: 0,
      show: false,
      clamp: true,
    },
    tabs: [
      { id: -1, title: 'Midterm', categoryId: -1, gradebookWeight: 25 },
      { id: -2, title: 'Final', categoryId: -1, gradebookWeight: 50 },
    ],
    assessments: [
      {
        id: -1,
        title: 'Midterm',
        tabId: -1,
        maxGrade: 50,
        external: true,
        floorAtZero: true,
        capAtMaximum: true,
      },
      {
        id: -2,
        title: 'Final',
        tabId: -2,
        maxGrade: 100,
        external: true,
        floorAtZero: true,
        capAtMaximum: true,
      },
      { id: 7, title: 'Native quiz', tabId: 3, maxGrade: 10 },
    ],
    capTotal: false,
  },
};

const externalWith = (overrides: {
  floorAtZero: boolean;
  capAtMaximum: boolean;
}): typeof preloadedState => ({
  gradebook: {
    ...preloadedState.gradebook,
    tabs: [{ id: -1, title: 'Midterm', categoryId: -1, gradebookWeight: 25 }],
    assessments: [
      {
        id: -1,
        title: 'Midterm',
        tabId: -1,
        maxGrade: 50,
        external: true,
        ...overrides,
      },
    ],
  },
});

describe('handleDragEnd', () => {
  beforeEach(() => {
    (reorderExternalAssessments as jest.Mock).mockClear();
  });

  it('does nothing when the row is dropped outside the list', () => {
    const dispatch = jest.fn() as unknown as AppDispatch;
    handleDragEnd([-1, -2, -3], dropResult(0, null), dispatch, jest.fn());
    expect(reorderExternalAssessments).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does nothing when the row is dropped back in its original position', () => {
    const dispatch = jest.fn() as unknown as AppDispatch;
    handleDragEnd([-1, -2, -3], dropResult(1, 1), dispatch, jest.fn());
    expect(reorderExternalAssessments).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches the reordered ids on a valid move', () => {
    const dispatch = jest.fn(() => Promise.resolve()) as unknown as AppDispatch;
    handleDragEnd([-1, -2, -3], dropResult(2, 0), dispatch, jest.fn());
    expect(reorderExternalAssessments).toHaveBeenCalledWith([-3, -1, -2]);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('invokes the error callback when the reorder dispatch rejects', async () => {
    const onError = jest.fn();
    const dispatch = jest.fn(() =>
      Promise.reject(new Error('nope')),
    ) as unknown as AppDispatch;
    handleDragEnd([-1, -2, -3], dropResult(0, 2), dispatch, onError);
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
  });
});

it('renders the external list body with no dialog shell and no import button', async () => {
  render(<ManageExternalAssessmentsContent />, { state: preloadedState });
  expect(await screen.findByText('Midterm')).toBeVisible();
  expect(
    screen.queryByRole('button', { name: /import csv/i }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /^close$/i }),
  ).not.toBeInTheDocument();
});

it('shows an empty state when there are no externals', async () => {
  render(<ManageExternalAssessmentsContent />, {
    state: { gradebook: { ...preloadedState.gradebook, assessments: [] } },
  });
  expect(await screen.findByText('No external assessments yet')).toBeVisible();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

it('lists only external assessments', async () => {
  render(<ManageExternalAssessmentsContent />, { state: preloadedState });
  expect(await screen.findByText('Name')).toBeVisible();
  expect(await screen.findByText('Midterm')).toBeVisible();
  expect(screen.queryByText('Native quiz')).not.toBeInTheDocument();
});

it('opens the add dialog', async () => {
  render(<ManageExternalAssessmentsContent />, { state: preloadedState });
  await userEvent.click(await screen.findByRole('button', { name: 'Add' }));
  await waitFor(() =>
    expect(screen.getByText('Add external assessment')).toBeVisible(),
  );
});

it('opens the edit prompt for a row', async () => {
  render(<ManageExternalAssessmentsContent />, { state: preloadedState });
  await userEvent.click(await screen.findByLabelText('edit Midterm'));
  await waitFor(() =>
    expect(screen.getByText('Edit external assessment')).toBeVisible(),
  );
});

it('opens the delete confirmation for a row', async () => {
  render(<ManageExternalAssessmentsContent />, { state: preloadedState });
  await userEvent.click(await screen.findByLabelText('delete Midterm'));
  expect(await screen.findByText('Delete external assessment')).toBeVisible();
  expect(
    screen.getByText(
      /Delete "Midterm"\? This permanently removes the column and every student grade in it\. This cannot be undone\./,
    ),
  ).toBeVisible();
});

it('hides weights when weighted view is disabled', async () => {
  render(<ManageExternalAssessmentsContent />, { state: preloadedState });
  await screen.findByText('Midterm');
  expect(screen.queryByText('Weight')).not.toBeInTheDocument();
  expect(screen.queryByText('25')).not.toBeInTheDocument();
});

it('never shows a Weight column, even when weighted view is enabled', async () => {
  render(<ManageExternalAssessmentsContent />, {
    state: {
      gradebook: { ...preloadedState.gradebook, weightedViewEnabled: true },
    },
  });
  await screen.findByText('Midterm');
  expect(screen.queryByText('Weight')).not.toBeInTheDocument();
  expect(screen.queryByText('25')).not.toBeInTheDocument();
});

it('hides the Remarks column when every external is at default bounds', async () => {
  render(<ManageExternalAssessmentsContent />, {
    state: externalWith({ floorAtZero: true, capAtMaximum: true }),
  });
  await screen.findByText('Midterm');
  expect(screen.queryByText(/remarks/i)).not.toBeInTheDocument();
  expect(screen.queryByText('≥ 0')).not.toBeInTheDocument();
  expect(screen.queryByText('≤ max')).not.toBeInTheDocument();
});

it('hides the Remarks column when flags are absent (default bounds)', async () => {
  render(<ManageExternalAssessmentsContent />, {
    state: {
      gradebook: {
        ...preloadedState.gradebook,
        assessments: [
          { id: -1, title: 'Midterm', tabId: -1, maxGrade: 50, external: true },
        ],
      },
    },
  });
  await screen.findByText('Midterm');
  expect(screen.queryByText(/remarks/i)).not.toBeInTheDocument();
});

it('shows Remarks with a No cap chip when capAtMaximum is false', async () => {
  render(<ManageExternalAssessmentsContent />, {
    state: externalWith({ floorAtZero: true, capAtMaximum: false }),
  });
  expect(await screen.findByText(/remarks/i)).toBeInTheDocument();
  expect(screen.getByText(/no cap/i)).toBeInTheDocument();
  expect(screen.queryByText(/no floor/i)).not.toBeInTheDocument();
});

it('shows Remarks with No floor and No cap chips when neither bound applies', async () => {
  render(<ManageExternalAssessmentsContent />, {
    state: externalWith({ floorAtZero: false, capAtMaximum: false }),
  });
  expect(await screen.findByText(/remarks/i)).toBeInTheDocument();
  expect(screen.getByText(/no floor/i)).toBeInTheDocument();
  expect(screen.getByText(/no cap/i)).toBeInTheDocument();
});

it('shows a hint explaining the No cap chip on hover', async () => {
  render(<ManageExternalAssessmentsContent />, {
    state: externalWith({ floorAtZero: true, capAtMaximum: false }),
  });
  await userEvent.hover(await screen.findByText(/no cap/i));
  expect(
    await screen.findByText(/kept as-is \(not capped\)/i),
  ).toBeVisible();
});

it('renders a drag handle per external assessment', async () => {
  const page = render(<ManageExternalAssessmentsContent />, {
    state: preloadedState,
  });
  expect(await page.findByLabelText('reorder Midterm')).toBeVisible();
  expect(await page.findByLabelText('reorder Final')).toBeVisible();
});

it('hides the drag handle when there is only one external assessment', async () => {
  const page = render(<ManageExternalAssessmentsContent />, {
    state: {
      gradebook: {
        ...preloadedState.gradebook,
        assessments: [
          {
            id: -1,
            title: 'Midterm',
            tabId: -1,
            maxGrade: 50,
            external: true,
            floorAtZero: true,
            capAtMaximum: true,
          },
        ],
      },
    },
  });
  // The row still renders, with its grade in place...
  expect(await page.findByText('Midterm')).toBeVisible();
  expect(page.getByText('50')).toBeVisible();
  // ...but the lone row has no reorder handle, so it cannot be dragged.
  expect(page.queryByLabelText('reorder Midterm')).not.toBeInTheDocument();
});

describe('moveItem', () => {
  it('moves an item from one index to another, preserving the rest', () => {
    expect(moveItem([-1, -2, -3], 2, 0)).toEqual([-3, -1, -2]);
    expect(moveItem([-1, -2, -3], 0, 2)).toEqual([-2, -3, -1]);
  });
});
