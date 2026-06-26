import { useLocation } from 'react-router-dom';
import { fireEvent, render, screen, waitFor, within } from 'test-utils';

import toast from 'lib/hooks/toast';

import fetchGradebook from '../operations';
import GradebookIndex from '../pages/GradebookIndex';

// TestApp mounts a MemoryRouter, whose location lives in memory and never
// touches window.location. This spy surfaces the router's current search
// string into the DOM so tests can assert on URL changes.
const LocationSearch = (): JSX.Element => (
  <div data-testid="location-search">{useLocation().search}</div>
);

jest.mock('../../container/CourseLoader', () => ({
  useCourseContext: (): { courseTitle: string; id: number } => ({
    courseTitle: 'Test Course',
    id: 1,
  }),
}));

jest.mock('lib/hooks/toast', () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));

jest.mock('../operations', () => ({
  __esModule: true,
  default: jest.fn(() => (): Promise<void> => Promise.resolve()),
}));

const mockFetchGradebook = fetchGradebook as jest.Mock;

const emptyState = {
  gradebook: {
    categories: [],
    tabs: [],
    assessments: [],
    students: [],
    submissions: [],
    gamificationEnabled: false,
    weightedViewEnabled: false,
    canManageWeights: false,
  },
};

const noStudentsState = {
  gradebook: {
    categories: [{ id: 1, title: 'Cat A' }],
    tabs: [{ id: 10, title: 'Tab 1', categoryId: 1 }],
    assessments: [{ id: 100, title: 'Quiz 1', tabId: 10, maxGrade: 10 }],
    students: [],
    submissions: [],
    gamificationEnabled: false,
    weightedViewEnabled: false,
    canManageWeights: false,
  },
};

const populatedState = {
  gradebook: {
    categories: [{ id: 1, title: 'Cat A' }],
    tabs: [{ id: 10, title: 'Tab 1', categoryId: 1 }],
    assessments: [{ id: 100, title: 'Quiz 1', tabId: 10, maxGrade: 10 }],
    students: [
      {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        externalId: null,
        level: 3,
        totalXp: 150,
      },
    ],
    submissions: [
      { studentId: 1, assessmentId: 100, submissionId: 1000, grade: 8 },
    ],
    gamificationEnabled: false,
    weightedViewEnabled: false,
    canManageWeights: false,
  },
};

const studentsNoAssessmentsState = {
  gradebook: {
    ...populatedState.gradebook,
    categories: [],
    tabs: [],
    assessments: [],
    submissions: [],
  },
};

const populatedStateWithGamification = {
  gradebook: {
    ...populatedState.gradebook,
    gamificationEnabled: true,
  },
};

const populatedStateWithWeightedView = {
  gradebook: {
    ...populatedState.gradebook,
    weightedViewEnabled: true,
    canManageWeights: false,
  },
};

const populatedStateWithWeightedViewAndGamification = {
  gradebook: {
    ...populatedState.gradebook,
    weightedViewEnabled: true,
    gamificationEnabled: true,
    canManageWeights: false,
  },
};

const populatedStateManagerWeightedOff = {
  gradebook: {
    ...populatedState.gradebook,
    weightedViewEnabled: false,
    canManageWeights: true,
  },
};

const populatedStateManagerWeightedOn = {
  gradebook: {
    ...populatedState.gradebook,
    weightedViewEnabled: true,
    canManageWeights: true,
  },
};

const populatedStateExternalInRange = {
  gradebook: {
    ...populatedState.gradebook,
    assessments: [
      {
        id: 200,
        title: 'External Midterm',
        tabId: 10,
        maxGrade: 100,
        external: true,
        capAtMaximum: true,
        floorAtZero: true,
      },
    ],
    submissions: [
      { studentId: 1, assessmentId: 200, submissionId: 200, grade: 90 }, // within [0,100]
    ],
  },
};

const populatedStateWithOutOfRangeGrade = {
  gradebook: {
    ...populatedState.gradebook,
    assessments: [
      { id: 100, title: 'Quiz 1', tabId: 10, maxGrade: 10 },
      {
        id: 200,
        title: 'External Midterm',
        tabId: 10,
        maxGrade: 100,
        external: true,
        capAtMaximum: true,
        floorAtZero: true,
      },
    ],
    submissions: [
      { studentId: 1, assessmentId: 100, submissionId: 1000, grade: 8 },
      { studentId: 1, assessmentId: 200, submissionId: 200, grade: 110 }, // above max, capped
    ],
  },
};

const populatedStateWithOutOfRangeGradeWeighted = {
  gradebook: {
    ...populatedStateWithOutOfRangeGrade.gradebook,
    weightedViewEnabled: true,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchGradebook.mockReturnValue((): Promise<void> => Promise.resolve());
});

describe('GradebookIndex', () => {
  it('shows loading indicator initially', () => {
    render(<GradebookIndex />, { state: emptyState });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows the gradebook table after data loads', async () => {
    render(<GradebookIndex />, { state: populatedState });
    expect(
      await screen.findByRole('button', { name: /export/i }),
    ).toBeInTheDocument();
  });

  it('shows the page title', async () => {
    render(<GradebookIndex />, { state: populatedState });
    expect(await screen.findByText('Gradebook')).toBeInTheDocument();
  });

  it('shows the grade-link hint in the all-assessments view', async () => {
    render(<GradebookIndex />, { state: populatedState });
    expect(
      await screen.findByText(
        /Click any grade to open that submission and adjust the marks/i,
      ),
    ).toBeInTheDocument();
  });

  it('hides the grade-link hint in the weighted-total view', async () => {
    render(<GradebookIndex />, { state: populatedStateWithWeightedView });
    const byWeightButton = await screen.findByText(/weighted total/i);
    fireEvent.click(byWeightButton);
    await screen.findByTestId('gradebook-weighted-table');
    expect(
      screen.queryByText(
        /Click any grade to open that submission and adjust the marks/i,
      ),
    ).not.toBeInTheDocument();
  });

  it('shows empty students message and renders no gradebook table when there are no students', async () => {
    render(<GradebookIndex />, { state: emptyState });
    expect(
      await screen.findByText('No students enrolled yet'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('gradebook-weighted-table'),
    ).not.toBeInTheDocument();
  });

  it('renders the gradebook table when there are students but no assessments', async () => {
    render(<GradebookIndex />, { state: studentsNoAssessmentsState });
    expect(
      await screen.findByRole('button', { name: /export/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(
      screen.queryByText('No students enrolled yet'),
    ).not.toBeInTheDocument();
  });

  it('shows error toast when fetch fails', async () => {
    mockFetchGradebook.mockReturnValueOnce(
      (): Promise<never> => Promise.reject(new Error('Network error')),
    );
    render(<GradebookIndex />, { state: emptyState });
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it('shows grade-only hint in column picker when gamification is disabled and no data cols selected', async () => {
    render(<GradebookIndex />, { state: populatedState });
    fireEvent.click(
      await screen.findByRole('button', { name: /select columns/i }),
    );
    expect(
      await screen.findByText(
        'No grade columns selected - export will include student info only.',
      ),
    ).toBeInTheDocument();
  });

  it('shows grade-and-gamification hint in column picker after enabling a gamification column with no grade columns selected', async () => {
    render(<GradebookIndex />, { state: populatedStateWithGamification });
    fireEvent.click(
      await screen.findByRole('button', { name: /select columns/i }),
    );
    fireEvent.click(
      await screen.findByRole('checkbox', { name: /gamification/i }),
    );
    expect(
      await screen.findByText(
        'No grade or gamification columns selected - export will include student info only.',
      ),
    ).toBeInTheDocument();
  });

  it('does not render view toggle when weightedViewEnabled is false', async () => {
    render(<GradebookIndex />, { state: populatedState });
    // Wait for loading to finish
    await screen.findByRole('button', { name: /export/i });
    expect(screen.queryByText(/weighted total/i)).not.toBeInTheDocument();
  });

  it('renders view toggle when weightedViewEnabled is true', async () => {
    render(<GradebookIndex />, { state: populatedStateWithWeightedView });
    expect(await screen.findByText(/all assessments/i)).toBeInTheDocument();
    expect(await screen.findByText(/weighted total/i)).toBeInTheDocument();
  });

  it('switches to Weighted total view on toggle click and reflects it in the URL', async () => {
    render(
      <>
        <GradebookIndex />
        <LocationSearch />
      </>,
      { state: populatedStateWithWeightedView },
    );
    const byWeightButton = await screen.findByText(/weighted total/i);
    fireEvent.click(byWeightButton);
    expect(
      await screen.findByTestId('gradebook-weighted-table'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      'view=weighted',
    );

    fireEvent.click(await screen.findByText(/all assessments/i));
    await waitFor(() =>
      expect(screen.getByTestId('location-search')).not.toHaveTextContent(
        'view=weighted',
      ),
    );
  });

  it('starts in Weighted total view when the URL requests it', async () => {
    render(<GradebookIndex />, {
      state: populatedStateWithWeightedView,
      at: ['/?view=weighted'],
    });
    expect(
      await screen.findByTestId('gradebook-weighted-table'),
    ).toBeInTheDocument();
  });

  it('weighted view does not expose gamification columns in picker', async () => {
    render(<GradebookIndex />, {
      state: populatedStateWithWeightedViewAndGamification,
    });
    const byWeightButton = await screen.findByText(/weighted total/i);
    fireEvent.click(byWeightButton);
    await screen.findByTestId('gradebook-weighted-table');
    fireEvent.click(
      await screen.findByRole('button', { name: /select columns/i }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByText('Level')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Total XP')).not.toBeInTheDocument();
  });

  it('shows the manage button and not the old import/add buttons', async () => {
    render(<GradebookIndex />, { state: populatedStateManagerWeightedOff });
    expect(
      await screen.findByRole('button', {
        name: 'Manage external assessments',
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Import external assessments' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add external assessment' }),
    ).not.toBeInTheDocument();
  });

  it('shows the manage button in the weighted-total view for managers', async () => {
    render(<GradebookIndex />, { state: populatedStateManagerWeightedOn });
    const byWeightButton = await screen.findByText(/weighted total/i);
    fireEvent.click(byWeightButton);
    await screen.findByTestId('gradebook-weighted-table');
    expect(
      screen.getByRole('button', { name: 'Manage external assessments' }),
    ).toBeVisible();
  });

  it('does not show the manage button to staff who cannot manage weights', async () => {
    render(<GradebookIndex />, { state: populatedState });
    await screen.findByRole('button', { name: /export/i }); // wait for load
    expect(
      screen.queryByRole('button', { name: 'Manage external assessments' }),
    ).not.toBeInTheDocument();
  });

  describe('out-of-range banner', () => {
    it('shows the banner when there are out-of-range grades', async () => {
      render(<GradebookIndex />, { state: populatedStateWithOutOfRangeGrade });
      expect(
        await screen.findByText(/outside their range/i),
      ).toBeInTheDocument();
    });

    it('shows the weighted-total wording when the weighted view is enabled', async () => {
      render(<GradebookIndex />, {
        state: populatedStateWithOutOfRangeGradeWeighted,
      });
      expect(
        await screen.findByText(
          /being capped or floored in the weighted total/i,
        ),
      ).toBeInTheDocument();
    });

    it('does not show the banner when all grades are in range', async () => {
      render(<GradebookIndex />, { state: populatedStateExternalInRange });
      await screen.findByRole('button', { name: /export/i }); // wait for load
      expect(
        screen.queryByText(/outside their range/i),
      ).not.toBeInTheDocument();
    });

    it('does not show the banner when there are no students', async () => {
      render(<GradebookIndex />, { state: noStudentsState });
      await screen.findByText('No students enrolled yet');
      expect(
        screen.queryByText(/outside their range/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('weighted-view discoverability hint', () => {
    it('shows the hint to managers when the weighted view is off', async () => {
      render(<GradebookIndex />, { state: populatedStateManagerWeightedOff });
      expect(
        await screen.findByRole('link', { name: /gradebook settings/i }),
      ).toBeInTheDocument();
    });

    it('does not show the hint once the weighted view is enabled', async () => {
      render(<GradebookIndex />, { state: populatedStateManagerWeightedOn });
      await screen.findByText(/weighted total/i); // wait for data to load
      expect(
        screen.queryByRole('link', { name: /gradebook settings/i }),
      ).not.toBeInTheDocument();
    });

    it('does not show the hint to staff who cannot manage weights', async () => {
      render(<GradebookIndex />, { state: populatedState });
      await screen.findByRole('button', { name: /export/i }); // wait for load
      expect(
        screen.queryByRole('link', { name: /gradebook settings/i }),
      ).not.toBeInTheDocument();
    });
  });
});
