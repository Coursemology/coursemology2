import { fireEvent, render, screen } from 'test-utils';

import GradebookIndex from '../pages/GradebookIndex';
import { GradebookState } from '../types';

jest.mock('../operations', () => ({
  __esModule: true,
  default: () => (): Promise<void> => Promise.resolve(),
}));

const gradebookState: GradebookState = {
  tabs: [
    { id: 1, title: 'Assignments', categoryId: 10, categoryTitle: 'Missions' },
  ],
  assessments: [{ id: 10, title: 'Assignment 1', tabId: 1, maxGrade: 100 }],
  students: [
    {
      id: 1,
      name: 'Alice Smith',
      grades: { '10': 80 },
      totalGrade: 80,
      totalMaxGrade: 100,
    },
    {
      id: 2,
      name: 'Bob Jones',
      grades: { '10': 60 },
      totalGrade: 60,
      totalMaxGrade: 100,
    },
  ],
};

describe('<GradebookIndex />', () => {
  it('renders all students initially', async () => {
    render(<GradebookIndex />, { state: { gradebook: gradebookState } });
    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('filters students by name on search input', async () => {
    render(<GradebookIndex />, { state: { gradebook: gradebookState } });

    const input = await screen.findByPlaceholderText('Search by student name');
    fireEvent.change(input, { target: { value: 'alice' } });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
  });

  it('renders a show percentage toggle', async () => {
    render(<GradebookIndex />, { state: { gradebook: gradebookState } });
    expect(await screen.findByLabelText('Show percentage')).toBeInTheDocument();
  });

  it('shows raw scores by default', async () => {
    render(<GradebookIndex />, { state: { gradebook: gradebookState } });

    // Raw score is the default — Alice's grade shows as "80 / 100"
    expect(await screen.findAllByText('80 / 100')).not.toHaveLength(0);
    expect(screen.queryByText('80.00%')).not.toBeInTheDocument();
  });

  it('switches from raw score to percentage when the toggle is clicked', async () => {
    render(<GradebookIndex />, { state: { gradebook: gradebookState } });

    // Wait for default raw score rendering
    await screen.findAllByText('80 / 100');

    // Click the "Show percentage" toggle
    fireEvent.click(screen.getByLabelText('Show percentage'));

    // Percentage replaces the raw score
    expect(await screen.findAllByText('80.00%')).not.toHaveLength(0);
    expect(screen.queryByText('80 / 100')).not.toBeInTheDocument();
  });
});
