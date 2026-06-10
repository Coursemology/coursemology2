import { fireEvent, render, screen, waitFor, within } from 'test-utils';

import toast from 'lib/hooks/toast';

import fetchGradebook from '../operations';
import GradebookIndex from '../pages/GradebookIndex';

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
    userId: 0,
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
    userId: 0,
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
    submissions: [{ submissionId: 0, studentId: 1, assessmentId: 100, grade: 8 }],
    gamificationEnabled: false,
    userId: 0,
    weightedViewEnabled: false,
    canManageWeights: false,
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

  it('shows empty students message when there are no students', async () => {
    render(<GradebookIndex />, { state: noStudentsState });
    expect(
      await screen.findByText('No students enrolled yet'),
    ).toBeInTheDocument();
  });

  it('shows empty students message when both assessments and students are absent', async () => {
    render(<GradebookIndex />, { state: emptyState });
    expect(
      await screen.findByText('No students enrolled yet'),
    ).toBeInTheDocument();
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

  it('shows grade-and-gamification hint in column picker when gamification is enabled and no data cols selected', async () => {
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
    expect(screen.queryByText(/by weight/i)).not.toBeInTheDocument();
  });

  it('renders view toggle when weightedViewEnabled is true', async () => {
    render(<GradebookIndex />, { state: populatedStateWithWeightedView });
    expect(await screen.findByText(/raw scores/i)).toBeInTheDocument();
    expect(await screen.findByText(/by weight/i)).toBeInTheDocument();
  });

  it('switches to By weight view on toggle click', async () => {
    render(<GradebookIndex />, { state: populatedStateWithWeightedView });
    const byWeightButton = await screen.findByText(/by weight/i);
    fireEvent.click(byWeightButton);
    expect(
      await screen.findByTestId('gradebook-weighted-table'),
    ).toBeInTheDocument();
  });

  it('weighted view exposes gamification columns in picker when gamification is enabled', async () => {
    render(<GradebookIndex />, {
      state: populatedStateWithWeightedViewAndGamification,
    });
    const byWeightButton = await screen.findByText(/by weight/i);
    fireEvent.click(byWeightButton);
    await screen.findByTestId('gradebook-weighted-table');
    fireEvent.click(
      await screen.findByRole('button', { name: /select columns/i }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Level')).toBeInTheDocument();
    expect(within(dialog).getByText('Total XP')).toBeInTheDocument();
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
      await screen.findByText(/by weight/i); // wait for data to load
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
