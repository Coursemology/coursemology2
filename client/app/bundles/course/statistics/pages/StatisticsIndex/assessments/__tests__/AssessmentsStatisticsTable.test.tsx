import { render, screen } from 'test-utils';

import { CourseAssessment } from 'course/statistics/types';

import AssessmentsStatisticsTable from '../AssessmentsStatisticsTable';

const assessments: CourseAssessment[] = [
  {
    id: 1,
    title: 'Quiz 1',
    startAt: new Date('2026-01-01T00:00:00Z'),
    tab: { id: 1, title: 'Tab 1' },
    category: { id: 1, title: 'Category 1' },
    maximumGrade: 10,
    numSubmitted: 2,
    numAttempted: 3,
    numLate: 1,
  },
];

const renderTable = (gradebookEnabled = true): void => {
  render(
    <AssessmentsStatisticsTable
      assessments={assessments}
      gradebookEnabled={gradebookEnabled}
      numStudents={3}
    />,
    { at: ['/courses/1/statistics/assessments'] },
  );
};

describe('<AssessmentsStatisticsTable />', () => {
  // Regression guard: an orphaned rowSelectable (selection with no activeToolbar)
  // makes the toolbar render an empty 6.5rem bar on select, shifting every row down.
  // Re-enabling row selection here brings that layout bug back.
  it('keeps row selection off so selecting cannot shift the table down', async () => {
    renderTable();
    await screen.findByText('Quiz 1');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders the native CSV download button', async () => {
    renderTable();
    expect(await screen.findByTestId('DownloadIcon')).toBeInTheDocument();
  });

  it('points to the Gradebook for individual student grades when enabled', async () => {
    renderTable(true);
    const link = await screen.findByRole('link', { name: /gradebook/i });
    expect(link).toHaveAttribute('href', '/courses/1/gradebook');
  });

  it('omits the Gradebook pointer when the gradebook is disabled', async () => {
    renderTable(false);
    await screen.findByText('Quiz 1');
    expect(
      screen.queryByRole('link', { name: /gradebook/i }),
    ).not.toBeInTheDocument();
  });
});
