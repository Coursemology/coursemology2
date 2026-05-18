import { render, screen } from 'test-utils';

import GradebookTable from '../components/GradebookTable';
import { AssessmentData, StudentRow, TabData } from '../types';

const tabs: TabData[] = [
  { id: 1, title: 'Assignments', categoryId: 10, categoryTitle: 'Missions' },
  { id: 2, title: 'Quizzes', categoryId: 10, categoryTitle: 'Missions' },
];

const assessments: AssessmentData[] = [
  { id: 10, title: 'Assignment 1', tabId: 1, maxGrade: 100 },
  { id: 20, title: 'Quiz 1', tabId: 2, maxGrade: 20 },
  { id: 30, title: 'Quiz 2', tabId: 2, maxGrade: 0 },
];

const students: StudentRow[] = [
  {
    id: 1,
    name: 'Alice Smith',
    grades: { '10': 80, '20': 15, '30': 0 },
    totalGrade: 95,
    totalMaxGrade: 120,
  },
  {
    id: 2,
    name: 'Bob Jones',
    grades: { '10': 0, '20': 0, '30': 0 },
    totalGrade: 0,
    totalMaxGrade: 100,
  },
];

describe('<GradebookTable />', () => {
  it('renders a column header for each assessment and a Total column', async () => {
    render(
      <GradebookTable
        assessments={assessments}
        showPercentage={false}
        students={students}
        tabs={tabs}
      />,
    );
    expect(await screen.findByText('Assignment 1')).toBeInTheDocument();
    expect(screen.getByText('Quiz 1')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders student names', async () => {
    render(
      <GradebookTable
        assessments={assessments}
        showPercentage={false}
        students={students}
        tabs={tabs}
      />,
    );
    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('renders a category header row spanning its tabs', async () => {
    render(
      <GradebookTable
        assessments={assessments}
        showPercentage={false}
        students={students}
        tabs={tabs}
      />,
    );
    expect(await screen.findByText('Missions')).toBeInTheDocument();
  });

  it('renders a tab header row with each tab title', async () => {
    render(
      <GradebookTable
        assessments={assessments}
        showPercentage={false}
        students={students}
        tabs={tabs}
      />,
    );
    const headers = await screen.findAllByRole('columnheader');
    const headerTexts = headers.map((h) => h.textContent);
    expect(headerTexts).toContain('Assignments');
    expect(headerTexts).toContain('Quizzes');
  });

  it('truncates a long assessment title in the column header', async () => {
    const longTitle =
      'This Is An Extremely Long Assessment Title That Should Be Visually Truncated';
    render(
      <GradebookTable
        assessments={[{ id: 99, title: longTitle, tabId: 1, maxGrade: 10 }]}
        showPercentage={false}
        students={students}
        tabs={tabs}
      />,
    );
    expect(await screen.findByText(longTitle)).toHaveClass('truncate');
  });

  describe('when showPercentage is true', () => {
    it('renders percentage for an assessment grade', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showPercentage
          students={students}
          tabs={tabs}
        />,
      );
      // Alice: 80/100 = 80.00%
      expect(await screen.findByText('80.00%')).toBeInTheDocument();
    });

    it('renders percentage for the total', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showPercentage
          students={students}
          tabs={tabs}
        />,
      );
      // Alice total: 95/120 = 79.17%
      expect(await screen.findByText('79.17%')).toBeInTheDocument();
    });

    it('renders – when maxGrade is 0', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showPercentage
          students={students}
          tabs={tabs}
        />,
      );
      expect((await screen.findAllByText('–')).length).toBeGreaterThan(0);
    });
  });

  describe('when showPercentage is false', () => {
    it('renders raw score for an assessment grade with sr-only accessible text', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showPercentage={false}
          students={students}
          tabs={tabs}
        />,
      );
      // Alice: 80/100 — accessible text is in an sr-only span
      expect((await screen.findAllByText('80 / 100')).length).toBeGreaterThan(0);
    });

    it('renders raw score for the total', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showPercentage={false}
          students={students}
          tabs={tabs}
        />,
      );
      expect((await screen.findAllByText('95 / 120')).length).toBeGreaterThan(0);
    });

    it('still renders – when maxGrade is 0', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showPercentage={false}
          students={students}
          tabs={tabs}
        />,
      );
      expect((await screen.findAllByText('–')).length).toBeGreaterThan(0);
    });
  });
});
