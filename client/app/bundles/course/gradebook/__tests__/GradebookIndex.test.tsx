import { fireEvent, render, screen, waitFor } from 'test-utils';

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
        level: 3,
        totalXp: 150,
      },
    ],
    submissions: [{ studentId: 1, assessmentId: 100, grade: 8 }],
    gamificationEnabled: false,
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
    await screen.findByText('Gradebook');
    expect(
      screen.queryByRole('button', { name: /by weight/i }),
    ).not.toBeInTheDocument();
  });

  it('renders view toggle when weightedViewEnabled is true', async () => {
    render(<GradebookIndex />, {
      state: {
        gradebook: {
          ...populatedState.gradebook,
          weightedViewEnabled: true,
          canManageWeights: false,
        },
      },
    });
    expect(
      await screen.findByRole('button', { name: /all assessments/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /by weight/i }),
    ).toBeInTheDocument();
  });

  it('switches to By weight view on toggle click', async () => {
    render(<GradebookIndex />, {
      state: {
        gradebook: {
          ...populatedState.gradebook,
          weightedViewEnabled: true,
          canManageWeights: false,
        },
      },
    });
    fireEvent.click(await screen.findByRole('button', { name: /by weight/i }));
    expect(screen.getByTestId('gradebook-weighted-table')).toBeInTheDocument();
  });
});
