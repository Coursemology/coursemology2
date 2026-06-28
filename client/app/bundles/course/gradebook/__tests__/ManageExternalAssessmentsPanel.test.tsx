import type { DropResult } from '@hello-pangea/dnd';
import userEvent from '@testing-library/user-event';
import type { AppDispatch } from 'store';
import { render, screen, waitFor, within } from 'test-utils';

import ManageExternalAssessmentsPanel, {
  handleDragEnd,
  moveItem,
} from '../components/manage/ManageExternalAssessmentsPanel';
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

jest.mock('../components/import/ImportExternalAssessmentsWizard', () => ({
  __esModule: true,
  default: ({
    existingAssessments,
    onClose,
    open,
  }: {
    existingAssessments: { name: string }[];
    onClose: () => void;
    open: boolean;
  }): JSX.Element | null =>
    open ? (
      <div data-testid="import-wizard" role="dialog">
        <h2>Import external assessments</h2>
        {existingAssessments.map((assessment) => (
          <button key={assessment.name} type="button">
            {assessment.name}
          </button>
        ))}
        <button onClick={onClose} type="button">
          Cancel
        </button>
        <button onClick={onClose} type="button">
          Confirm import
        </button>
      </div>
    ) : null,
}));

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

it('shows an empty state when there are no externals', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: { gradebook: { ...preloadedState.gradebook, assessments: [] } },
  });
  expect(await screen.findByText('No external assessments yet')).toBeVisible();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

it('lists only external assessments', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: preloadedState,
  });
  expect(await screen.findByText('Name')).toBeVisible();
  expect(await screen.findByText('Midterm')).toBeVisible();
  expect(screen.queryByText('Native quiz')).not.toBeInTheDocument();
});

it('opens the add dialog', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: preloadedState,
  });
  await userEvent.click(await screen.findByRole('button', { name: 'Add' }));
  await waitFor(() =>
    expect(screen.getByText('Add external assessment')).toBeVisible(),
  );
});

it('opens the edit prompt for a row', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: preloadedState,
  });
  await userEvent.click(
    await screen.findByRole('button', { name: 'edit Midterm' }),
  );
  await waitFor(() =>
    expect(screen.getByText('Edit external assessment')).toBeVisible(),
  );
});

it('opens the delete prompt for a row', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: preloadedState,
  });
  await userEvent.click(
    await screen.findByRole('button', { name: 'delete Midterm' }),
  );
  await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
});

it('invokes onClose when the close button is clicked', async () => {
  const onClose = jest.fn();
  render(<ManageExternalAssessmentsPanel onClose={onClose} open />, {
    state: preloadedState,
  });
  await userEvent.click(await screen.findByRole('button', { name: 'Close' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('opens the edit dialog for a row', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: preloadedState,
  });

  await userEvent.click(await screen.findByLabelText('edit Midterm'));
  expect(await screen.findByText('Edit external assessment')).toBeVisible();
});

it('seeds the edit dialog weightage from the tab weight (weighted view on)', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: {
      gradebook: {
        ...preloadedState.gradebook,
        weightedViewEnabled: true,
      },
    },
  });

  await userEvent.click(await screen.findByLabelText('edit Midterm'));
  expect(await screen.findByText('Edit external assessment')).toBeVisible();
  expect(await screen.findByLabelText('Weightage')).toHaveValue(25);
});

it('opens the delete confirmation for a row', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: preloadedState,
  });

  await userEvent.click(await screen.findByLabelText('delete Midterm'));
  expect(await screen.findByText('Delete external assessment')).toBeVisible();
  // the confirmation body names the assessment being deleted
  expect(
    screen.getByText(
      /Delete "Midterm"\? This permanently removes the column and every student grade in it\. This cannot be undone\./,
    ),
  ).toBeVisible();
});

it('hides weights when weighted view is disabled', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: preloadedState,
  });

  await screen.findByText('Midterm');
  expect(screen.queryByText('Weight')).not.toBeInTheDocument();
  expect(screen.queryByText('25')).not.toBeInTheDocument();
});

it('shows external assessment weights when weighted view is enabled', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: {
      gradebook: {
        ...preloadedState.gradebook,
        weightedViewEnabled: true,
      },
    },
  });

  expect(await screen.findByText('Weight')).toBeVisible();
  expect(screen.getByText('25')).toBeVisible();
});

it('renders bounds chips per the floor/cap flags', async () => {
  const stateWithMixedBounds = {
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
          capAtMaximum: false,
        },
      ],
    },
  };
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: stateWithMixedBounds,
  });

  expect(await screen.findByText('≥ 0')).toBeVisible();
  expect(screen.queryByText('≤ max')).not.toBeInTheDocument();
});

it('shows both bounds chips by default when flags are absent', async () => {
  const stateWithDefaultBounds = {
    gradebook: {
      ...preloadedState.gradebook,
      assessments: [
        { id: -1, title: 'Midterm', tabId: -1, maxGrade: 50, external: true },
      ],
    },
  };
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: stateWithDefaultBounds,
  });

  expect(await screen.findByText('≥ 0')).toBeVisible();
  expect(screen.getByText('≤ max')).toBeVisible();
});

it('shows the ≥ 0 and ≤ max chips for a floored and capped external', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: externalWith({ floorAtZero: true, capAtMaximum: true }),
  });

  expect(await screen.findByText('≥ 0')).toBeVisible();
  expect(screen.getByText('≤ max')).toBeVisible();
  expect(screen.getByText('50')).toBeVisible();
});

it('hides both bound chips when an external is neither floored nor capped', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: externalWith({ floorAtZero: false, capAtMaximum: false }),
  });

  await screen.findByText('Midterm');
  expect(screen.queryByText('≥ 0')).not.toBeInTheDocument();
  expect(screen.queryByText('≤ max')).not.toBeInTheDocument();
});

it('passes existing external names as chips to the import wizard', async () => {
  const stateWithExternal = {
    gradebook: {
      categories: [],
      tabs: [{ id: 1, title: 'External', categoryId: 0, gradebookWeight: 30 }],
      assessments: [
        {
          id: -1,
          title: 'Midterm',
          tabId: 1,
          maxGrade: 50,
          gradebookWeight: 30,
          external: true,
        },
      ],
      students: [],
      submissions: [],
      gamificationEnabled: false,
      weightedViewEnabled: true,
      canManageWeights: true,
      levelContribution: {
        enabled: false,
        formula: '',
        weight: 0,
        show: false,
        clamp: true,
      },
      courseMaxLevel: 0,
    },
  };
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: stateWithExternal,
  });

  // Open the import wizard
  await userEvent.click(
    await screen.findByRole('button', { name: /import csv/i }),
  );

  // The "Midterm" chip must appear in the define step
  expect(
    within(await screen.findByTestId('import-wizard')).getByText('Midterm'),
  ).toBeInTheDocument();
});

it('hides the external assessments panel while importing and reopens it on cancel', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: preloadedState,
  });

  expect(
    await screen.findByRole('heading', { name: 'External assessments' }),
  ).toBeVisible();

  await userEvent.click(
    await screen.findByRole('button', { name: /import csv/i }),
  );

  expect(await screen.findByText('Import external assessments')).toBeVisible();
  await waitFor(() =>
    expect(screen.queryByText('External assessments')).not.toBeInTheDocument(),
  );

  await userEvent.click(
    within(screen.getByTestId('import-wizard')).getByText('Cancel'),
  );

  expect(
    await screen.findByRole('heading', { name: 'External assessments' }),
  ).toBeVisible();
});

it('reopens the external assessments panel after a successful import', async () => {
  render(<ManageExternalAssessmentsPanel onClose={jest.fn()} open />, {
    state: preloadedState,
  });

  await userEvent.click(
    await screen.findByRole('button', { name: /import csv/i }),
  );
  expect(await screen.findByText('Import external assessments')).toBeVisible();
  await userEvent.click(
    within(screen.getByTestId('import-wizard')).getByText('Confirm import'),
  );

  expect(
    await screen.findByRole('heading', { name: 'External assessments' }),
  ).toBeVisible();
});

it('renders a drag handle per external assessment', async () => {
  const page = render(
    <ManageExternalAssessmentsPanel onClose={jest.fn()} open />,
    {
      state: preloadedState,
    },
  );
  expect(await page.findByLabelText('reorder Midterm')).toBeVisible();
  expect(await page.findByLabelText('reorder Final')).toBeVisible();
});

it('hides the drag handle when there is only one external assessment', async () => {
  const page = render(
    <ManageExternalAssessmentsPanel onClose={jest.fn()} open />,
    {
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
    },
  );
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
