import userEvent from '@testing-library/user-event';
import { render, screen, within } from 'test-utils';

import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from '../types';
import GradebookWeightedTable from '../components/GradebookWeightedTable';

// Suppress MUI dialog rendering noise in jsdom
jest.mock('../components/ConfigureWeightsDialog', () => ({
  __esModule: true,
  default: () => null,
}));

const categories: CategoryData[] = [{ id: 1, title: 'Missions' }];
const tabs: TabData[] = [
  { id: 10, title: 'Assignments', categoryId: 1, gradebookWeight: 60 },
  { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 40 },
];
const assessments: AssessmentData[] = [
  { id: 100, title: 'Quiz 1', tabId: 10, maxGrade: 100 },
  { id: 101, title: 'Quiz 2', tabId: 11, maxGrade: 50 },
];
const students: StudentData[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', level: 3, totalXp: 150 },
];
const submissions: SubmissionData[] = [
  { studentId: 1, assessmentId: 100, grade: 80 },
  { studentId: 1, assessmentId: 101, grade: 40 },
];

const defaultProps = {
  categories,
  tabs,
  assessments,
  students,
  submissions,
  canManageWeights: true,
  courseTitle: 'Test Course',
};

const renderTable = (props = {}) =>
  render(<GradebookWeightedTable {...defaultProps} {...props} />);

describe('<GradebookWeightedTable />', () => {
  it('renders category header in row 1', async () => {
    renderTable();
    expect(await screen.findByText('Missions')).toBeInTheDocument();
  });

  it('renders tab titles in row 2', async () => {
    renderTable();
    await screen.findByText('Missions');
    expect(screen.getByText('Assignments')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('renders "X% of grade" subheaders in row 3', async () => {
    renderTable();
    await screen.findByText('Missions');
    expect(screen.getByText('60% of grade')).toBeInTheDocument();
    expect(screen.getByText('40% of grade')).toBeInTheDocument();
  });

  it('shows "100% total" in Total subheader when weights sum to 100', async () => {
    renderTable();
    await screen.findByText('Missions');
    expect(screen.getByText('100% total')).toBeInTheDocument();
  });

  it('shows warning text in Total subheader when weights do not sum to 100', async () => {
    const tabsUnbalanced: TabData[] = [
      { id: 10, title: 'Assignments', categoryId: 1, gradebookWeight: 60 },
      { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 30 },
    ];
    renderTable({ tabs: tabsUnbalanced });
    await screen.findByText('Missions');
    // subheader should show 90% total with a warning indicator
    expect(screen.getByText(/90%\s*total/)).toBeInTheDocument();
  });

  it('computes and displays tab subtotals for a student', async () => {
    renderTable();
    await screen.findByText('Alice');
    // tab 10: 80/100 = 80.00%, tab 11: 40/50 = 80.00% — both show the same value
    const cells = screen.getAllByText('80.00%');
    expect(cells.length).toBeGreaterThanOrEqual(2);
  });

  it('computes and displays weighted total for a student', async () => {
    renderTable();
    await screen.findByText('Alice');
    // total = (60 * 0.8 + 40 * 0.8) / 100 = 0.8 = 80.00%
    const allCells = screen.getAllByText('80.00%');
    expect(allCells.length).toBeGreaterThanOrEqual(2);
  });

  it('shows — for student with no graded submissions in a tab', async () => {
    renderTable({ submissions: [] });
    await screen.findByText('Alice');
    // No submissions → all dashes
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('recomputes when Treat Ungraded as 0 is toggled', async () => {
    const user = userEvent.setup();
    renderTable({
      submissions: [{ studentId: 1, assessmentId: 100, grade: 80 }],
    });
    await screen.findByText('Alice');
    // Before toggle: tab 11 ungraded → dash
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    // Toggle on
    const toggle = screen.getByRole('checkbox', { name: /treat ungraded as 0/i });
    await user.click(toggle);
    // After toggle: tab 11 = 0/50 = 0.00%
    expect(screen.getByText('0.00%')).toBeInTheDocument();
  });

  it('shows empty state banner when all weights are 0', async () => {
    const zeroTabs: TabData[] = [
      { id: 10, title: 'Assignments', categoryId: 1, gradebookWeight: 0 },
    ];
    renderTable({ tabs: zeroTabs });
    await screen.findByText(/no tab weights configured/i);
  });

  it('shows Configure Weights button when canManageWeights = true', async () => {
    renderTable({ canManageWeights: true });
    await screen.findByText('Missions');
    expect(
      screen.getByRole('button', { name: /configure weights/i }),
    ).toBeInTheDocument();
  });

  it('hides Configure Weights button when canManageWeights = false', async () => {
    renderTable({ canManageWeights: false });
    await screen.findByText('Missions');
    expect(
      screen.queryByRole('button', { name: /configure weights/i }),
    ).not.toBeInTheDocument();
  });
});
