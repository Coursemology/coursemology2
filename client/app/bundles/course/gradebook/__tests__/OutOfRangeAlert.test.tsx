import { render, screen } from 'test-utils';

import OutOfRangeAlert from '../components/OutOfRangeAlert';

describe('OutOfRangeAlert', () => {
  it('renders nothing when there are no out-of-range grades', async () => {
    render(
      <OutOfRangeAlert
        assessmentNames={[]}
        gradeCount={0}
        weightedViewEnabled={false}
      />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('summarises counts, assessment names, and prompts review before export', async () => {
    render(
      <OutOfRangeAlert
        assessmentNames={['External Quiz', 'Final Exam']}
        gradeCount={3}
        weightedViewEnabled={false}
      />,
    );

    expect(
      await screen.findByText(
        /3 grades in the external assessments External Quiz and Final Exam/i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/review before exporting/i)).toBeInTheDocument();
  });

  it('joins three or more assessment names with a locale-aware list', async () => {
    render(
      <OutOfRangeAlert
        assessmentNames={['Quiz A', 'Quiz B', 'Quiz C']}
        gradeCount={4}
        weightedViewEnabled={false}
      />,
    );

    // Intl.ListFormat under en-GB — British/Singapore English joins without an
    // Oxford comma: "A, B and C", not "A, B, and C".
    expect(
      await screen.findByText(/Quiz A, Quiz B and Quiz C/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Quiz A, Quiz B, and Quiz C/i),
    ).not.toBeInTheDocument();
  });

  it('uses singular grade/assessment wording and a bare name for one grade', async () => {
    render(
      <OutOfRangeAlert
        assessmentNames={['External Quiz']}
        gradeCount={1}
        weightedViewEnabled={false}
      />,
    );

    expect(
      await screen.findByText(
        /1 grade in the external assessment External Quiz is outside their range/i,
      ),
    ).toBeInTheDocument();
  });

  it('names the weighted-total capping/flooring when the weighted view is on', async () => {
    render(
      <OutOfRangeAlert
        assessmentNames={['External Quiz']}
        gradeCount={2}
        weightedViewEnabled
      />,
    );

    expect(
      await screen.findByText(/being capped or floored in the weighted total/i),
    ).toBeInTheDocument();
  });

  it('omits the weighted-total clause when the weighted view is off', async () => {
    render(
      <OutOfRangeAlert
        assessmentNames={['External Quiz']}
        gradeCount={2}
        weightedViewEnabled={false}
      />,
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
      screen.queryByText(/being capped or floored in the weighted total/i),
    ).not.toBeInTheDocument();
  });

  it('does not mention the weighted total when weighting is off', async () => {
    render(
      <OutOfRangeAlert
        assessmentNames={['Quiz 1', 'Quiz 2']}
        gradeCount={908}
        weightedViewEnabled={false}
      />,
    );
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).not.toMatch(/weighted total/i);
    expect(alert.textContent).not.toMatch(/capped or floored/i);
  });

  it('mentions the weighted total when weighting is on', async () => {
    render(
      <OutOfRangeAlert
        assessmentNames={['Quiz 1']}
        gradeCount={3}
        weightedViewEnabled
      />,
    );
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/weighted total/i);
  });
});
