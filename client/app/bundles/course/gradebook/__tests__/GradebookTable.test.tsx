import { render, screen, waitForElementToBeRemoved } from 'test-utils';

import GradebookTable from '../components/GradebookTable';
import { AssessmentData, StudentRow, TabData } from '../types';

const tabs: TabData[] = [
  { id: 1, title: 'Assignments' },
  { id: 2, title: 'Quizzes' },
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
        showRawScore={false}
        students={students}
        tabs={tabs}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Assignment 1')).toBeInTheDocument();
    expect(screen.getByText('Quiz 1')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders student names', async () => {
    render(
      <GradebookTable
        assessments={assessments}
        showRawScore={false}
        students={students}
        tabs={tabs}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('renders a legend entry for each tab', async () => {
    render(
      <GradebookTable
        assessments={assessments}
        showRawScore={false}
        students={students}
        tabs={tabs}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Assignments')).toBeInTheDocument();
    expect(screen.getByText('Quizzes')).toBeInTheDocument();
  });

  it('truncates a long assessment title in the column header', async () => {
    const longTitle =
      'This Is An Extremely Long Assessment Title That Should Be Visually Truncated';
    render(
      <GradebookTable
        assessments={[{ id: 99, title: longTitle, tabId: 1, maxGrade: 10 }]}
        showRawScore={false}
        students={students}
        tabs={tabs}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText(longTitle)).toHaveClass('truncate');
  });

  describe('when showRawScore is false', () => {
    it('renders percentage for an assessment grade', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showRawScore={false}
          students={students}
          tabs={tabs}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      // Alice: 80/100 = 80.00%
      expect(screen.getByText('80.00%')).toBeInTheDocument();
    });

    it('renders percentage for the total', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showRawScore={false}
          students={students}
          tabs={tabs}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      // Alice total: 95/120 = 79.17%
      expect(screen.getByText('79.17%')).toBeInTheDocument();
    });

    it('renders – when maxGrade is 0', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showRawScore={false}
          students={students}
          tabs={tabs}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      // Quiz 2 has maxGrade 0 — both students show –
      expect(screen.getAllByText('–').length).toBeGreaterThan(0);
    });
  });

  describe('when showRawScore is true', () => {
    it('renders raw score for an assessment grade', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showRawScore
          students={students}
          tabs={tabs}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('80 / 100')).toBeInTheDocument();
    });

    it('renders raw score for the total', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showRawScore
          students={students}
          tabs={tabs}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('95 / 120')).toBeInTheDocument();
    });

    it('still renders – when maxGrade is 0', async () => {
      render(
        <GradebookTable
          assessments={assessments}
          showRawScore
          students={students}
          tabs={tabs}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getAllByText('–').length).toBeGreaterThan(0);
    });
  });
});
