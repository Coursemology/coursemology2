import { render, screen } from 'test-utils';

import GradebookTable from '../components/GradebookTable';
import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from '../types';

const categories: CategoryData[] = [{ id: 1, title: 'Cat A' }];
const tabs: TabData[] = [{ id: 10, title: 'Tab 1', categoryId: 1 }];
const assessments: AssessmentData[] = [
  { id: 100, title: 'Quiz 1', tabId: 10, maxGrade: 10 },
];
const students: StudentData[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', externalId: null, level: 3 },
  { id: 2, name: 'Bob', email: 'bob@example.com', externalId: null, level: 5 },
];
const submissions: SubmissionData[] = [
  { studentId: 1, assessmentId: 100, grade: 8, workflowState: 'graded' },
];

describe('GradebookTable', () => {
  it('renders both student names', () => {
    render(
      <GradebookTable
        assessments={assessments}
        categories={categories}
        students={students}
        submissions={submissions}
        tabs={tabs}
      />,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders a single header row', () => {
    const { container } = render(
      <GradebookTable
        assessments={assessments}
        categories={categories}
        students={students}
        submissions={submissions}
        tabs={tabs}
      />,
    );
    expect(container.querySelectorAll('thead tr')).toHaveLength(1);
  });

  it('shows assessment name in the header', () => {
    render(
      <GradebookTable
        assessments={assessments}
        categories={categories}
        students={students}
        submissions={submissions}
        tabs={tabs}
      />,
    );
    expect(screen.getByText('Quiz 1')).toBeInTheDocument();
  });

  it('shows the Level column header', () => {
    render(
      <GradebookTable
        assessments={assessments}
        categories={categories}
        students={students}
        submissions={submissions}
        tabs={tabs}
      />,
    );
    expect(screen.getByText('Level')).toBeInTheDocument();
  });

  it('shows the Export… button', () => {
    render(
      <GradebookTable
        assessments={assessments}
        categories={categories}
        students={students}
        submissions={submissions}
        tabs={tabs}
      />,
    );
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('shows the Points Possible row with the assessment maxGrade', () => {
    render(
      <GradebookTable
        assessments={assessments}
        categories={categories}
        students={students}
        submissions={submissions}
        tabs={tabs}
      />,
    );
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders grade for a student with a submission', () => {
    render(
      <GradebookTable
        assessments={assessments}
        categories={categories}
        students={students}
        submissions={submissions}
        tabs={tabs}
      />,
    );
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders — for a student with no submission', () => {
    render(
      <GradebookTable
        assessments={assessments}
        categories={categories}
        students={students}
        submissions={submissions}
        tabs={tabs}
      />,
    );
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('renders the student level', () => {
    render(
      <GradebookTable
        assessments={assessments}
        categories={categories}
        students={students}
        submissions={submissions}
        tabs={tabs}
      />,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
