import { render, screen } from 'test-utils';

import GradebookIndex from '../pages/GradebookIndex';

jest.mock('../operations', () => ({
  __esModule: true,
  default: () => (): Promise<void> => Promise.resolve(),
}));

const emptyState = {
  gradebook: {
    categories: [],
    tabs: [],
    assessments: [],
    students: [],
    submissions: [],
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
      },
    ],
    submissions: [
      { studentId: 1, assessmentId: 100, grade: 8, workflowState: 'graded' },
    ],
  },
};

describe('GradebookIndex', () => {
  it('shows loading indicator initially', () => {
    render(<GradebookIndex />, { state: emptyState });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows the gradebook table after data loads', async () => {
    render(<GradebookIndex />, { state: populatedState });
    expect(await screen.findByText('Alice')).toBeInTheDocument();
  });

  it('shows the page title', async () => {
    render(<GradebookIndex />, { state: populatedState });
    expect(await screen.findByText('Gradebook')).toBeInTheDocument();
  });
});
