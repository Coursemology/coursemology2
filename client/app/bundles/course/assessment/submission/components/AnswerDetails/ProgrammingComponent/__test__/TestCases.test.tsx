/* eslint-disable sonarjs/no-duplicate-string */
import { render, waitFor, within } from 'test-utils';

import TestCases, {
  TestCasesProps,
} from 'course/assessment/submission/components/AnswerDetails/ProgrammingComponent/TestCases';
// The submission edit page's gating: `graderView` is the grader's student-view toggle, and the
// remaining flags are the course/assessment settings that decide what a student may see.
const defaultStudentViewProps: TestCasesProps = {
  graderView: false,
  canReadTests: false,
  showPublicTestCasesOutput: false,
  showStdoutAndStderr: false,
  showPrivateTestToStudents: false,
  showEvaluationTestToStudents: false,
  isAutograding: false,
  testCases: {
    public_test: [
      {
        id: 1,
        identifier: 'public_test_1_identifier',
        expression: 'public_test_1_expression',
        expected: 'public_test_1_expected',
      },
    ],
    private_test: [
      {
        id: 2,
        identifier: 'private_test_1_identifier',
        expression: 'private_test_1_expression',
        expected: 'private_test_1_expected',
      },
    ],
    evaluation_test: [
      {
        id: 3,
        identifier: 'evaluation_test_1_identifier',
        expression: 'evaluation_test_1_expression',
        expected: 'evaluation_test_1_expected',
      },
    ],
  },
  stdout: 'stdout',
  stderr: 'stderr',
};

const defaultStaffViewProps: TestCasesProps = {
  ...defaultStudentViewProps,
  graderView: true,
  canReadTests: true,
};

const getWarning = (page, text: string): HTMLElement | null =>
  within(page.getByText(text).closest('div')).queryByText(
    'Only staff can see this.',
    { exact: false },
  );

// `render` mounts an I18nProvider that shows a spinner until its translations resolve, so nothing
// under test exists on the first tick. Every assertion that something is *absent* has to wait for
// the component to mount first, or it passes vacuously against the spinner. The public test case
// panel is rendered in every scenario here, so awaiting it is a reliable anchor.
const waitForMount = async (page): Promise<void> => {
  expect(await page.findByText('Public Test Cases')).toBeVisible();
};

describe('TestCases', () => {
  describe('when viewing as staff', () => {
    it('renders all test cases and standard streams', async () => {
      const page = render(<TestCases {...defaultStaffViewProps} />);

      expect(await page.findByText('Public Test Cases')).toBeVisible();
      expect(page.getByText('Private Test Cases')).toBeVisible();
      expect(page.getByText('Evaluation Test Cases')).toBeVisible();
      expect(page.getByText('Standard Output')).toBeVisible();
      expect(page.getByText('Standard Error')).toBeVisible();
    });

    it('renders staff-only warnings', async () => {
      const page = render(<TestCases {...defaultStaffViewProps} />);

      await waitFor(() => {
        expect(getWarning(page, 'Private Test Cases')).toBeVisible();
        expect(getWarning(page, 'Evaluation Test Cases')).toBeVisible();
        expect(getWarning(page, 'Standard Output')).toBeVisible();
        expect(getWarning(page, 'Standard Error')).toBeVisible();
      });
    });

    describe('when the submission is published and the assessment shows both types', () => {
      it('does not render staff-only warnings', async () => {
        const page = render(
          <TestCases
            {...defaultStaffViewProps}
            showEvaluationTestToStudents
            showPrivateTestToStudents
          />,
        );

        await waitFor(() => {
          expect(
            getWarning(page, 'Private Test Cases'),
          ).not.toBeInTheDocument();
          expect(
            getWarning(page, 'Evaluation Test Cases'),
          ).not.toBeInTheDocument();
        });
      });
    });

    describe('when students can see standard streams', () => {
      it('does not render staff-only warnings', async () => {
        const page = render(
          <TestCases {...defaultStaffViewProps} showStdoutAndStderr />,
        );

        await waitFor(() => {
          expect(getWarning(page, 'Standard Output')).not.toBeInTheDocument();
          expect(getWarning(page, 'Standard Error')).not.toBeInTheDocument();
        });
      });
    });

    it('renders test case identifiers', async () => {
      const page = render(<TestCases {...defaultStaffViewProps} />);

      expect(await page.findByText('public_test_1_identifier')).toBeVisible();
    });
  });

  describe('when viewing as a student', () => {
    it('does not show any staff-only warnings', async () => {
      const page = render(
        <TestCases
          {...defaultStudentViewProps}
          showEvaluationTestToStudents
          showPrivateTestToStudents
          showStdoutAndStderr
        />,
      );

      await waitFor(() => {
        expect(getWarning(page, 'Private Test Cases')).not.toBeInTheDocument();
        expect(
          getWarning(page, 'Evaluation Test Cases'),
        ).not.toBeInTheDocument();
        expect(getWarning(page, 'Standard Output')).not.toBeInTheDocument();
        expect(getWarning(page, 'Standard Error')).not.toBeInTheDocument();
      });
    });

    it('shows standard streams when the flag is enabled', async () => {
      const page = render(
        <TestCases {...defaultStudentViewProps} showStdoutAndStderr />,
      );

      expect(await page.findByText('Standard Output')).toBeVisible();
      expect(page.getByText('Standard Error')).toBeVisible();
    });

    it('does not show standard streams when the flag is disabled', async () => {
      const page = render(<TestCases {...defaultStudentViewProps} />);
      await waitForMount(page);

      expect(page.queryByText('Standard Output')).not.toBeInTheDocument();
      expect(page.queryByText('Standard Error')).not.toBeInTheDocument();
    });

    it('shows private and evaluation tests once the assessment allows it', async () => {
      const page = render(
        <TestCases
          {...defaultStudentViewProps}
          showEvaluationTestToStudents
          showPrivateTestToStudents
        />,
      );

      expect(await page.findByText('Private Test Cases')).toBeVisible();
      expect(page.getByText('Evaluation Test Cases')).toBeVisible();
    });

    it('does not show private and evaluation tests otherwise', async () => {
      const page = render(<TestCases {...defaultStudentViewProps} />);
      await waitForMount(page);

      expect(page.queryByText('Private Test Cases')).not.toBeInTheDocument();
      expect(page.queryByText('Evaluation Test Cases')).not.toBeInTheDocument();
    });

    it('does not render test case identifiers', async () => {
      const page = render(<TestCases {...defaultStudentViewProps} />);
      await waitForMount(page);

      expect(
        page.queryByText('public_test_1_identifier'),
      ).not.toBeInTheDocument();
    });
  });

  describe('test case results', () => {
    it('shows no outcome chip before the answer is graded', async () => {
      const page = render(<TestCases {...defaultStaffViewProps} />);
      await waitForMount(page);

      expect(page.queryByText('All passed')).not.toBeInTheDocument();
      expect(page.queryByText('All failed')).not.toBeInTheDocument();
    });

    it('joins results to their test cases by test case id', async () => {
      const page = render(
        <TestCases
          {...defaultStaffViewProps}
          testResults={{
            public_test: {
              1: { id: 1, output: 'public_test_1_output', passed: true },
            },
          }}
        />,
      );

      expect(await page.findByText('All passed')).toBeVisible();
      expect(page.getByText('public_test_1_output')).toBeVisible();
    });

    it('reports a failed run', async () => {
      const page = render(
        <TestCases
          {...defaultStaffViewProps}
          testResults={{
            public_test: { 1: { id: 1, passed: false } },
          }}
        />,
      );

      expect(await page.findByText('All failed')).toBeVisible();
    });

    it('reports a partially passed run', async () => {
      const page = render(
        <TestCases
          {...defaultStaffViewProps}
          testCases={{
            public_test: [
              { id: 1, expression: 'one', expected: '1' },
              { id: 2, expression: 'two', expected: '2' },
            ],
          }}
          testResults={{
            public_test: {
              1: { id: 1, passed: true },
              2: { id: 2, passed: false },
            },
          }}
        />,
      );

      expect(await page.findByText('1/2 passed')).toBeVisible();
    });
  });

  // Past answers and assessment statistics pass no course settings: the server has already filtered
  // the payload for the viewer, so what arrived is what should be rendered. Neither the output column
  // nor the stream panels are gated on their data being present the way the test case panels are, so
  // these have to fall back to the payload rather than to the permissive setting.
  describe('when the caller omits the course settings', () => {
    const serverFilteredProps: TestCasesProps = {
      canReadTests: false,
      testCases: {
        public_test: [{ id: 1, expression: 'one', expected: '1' }],
      },
    };

    it('hides the output column when no result carries an output', async () => {
      const page = render(
        <TestCases
          {...serverFilteredProps}
          testResults={{ public_test: { 1: { id: 1, passed: true } } }}
        />,
      );
      await waitForMount(page);

      expect(page.queryByText('Output')).not.toBeInTheDocument();
    });

    it('shows the output column when a result carries an output', async () => {
      const page = render(
        <TestCases
          {...serverFilteredProps}
          testResults={{
            public_test: { 1: { id: 1, output: 'one_output', passed: true } },
          }}
        />,
      );

      expect(await page.findByText('Output')).toBeVisible();
      expect(page.getByText('one_output')).toBeVisible();
    });

    it('still honours an explicit false over the payload', async () => {
      const page = render(
        <TestCases
          {...serverFilteredProps}
          showPublicTestCasesOutput={false}
          testResults={{
            public_test: { 1: { id: 1, output: 'one_output', passed: true } },
          }}
        />,
      );
      await waitForMount(page);

      expect(page.queryByText('Output')).not.toBeInTheDocument();
    });

    it('hides the stream panels when the payload carries neither stream', async () => {
      const page = render(<TestCases {...serverFilteredProps} />);
      await waitForMount(page);

      expect(page.queryByText('Standard Output')).not.toBeInTheDocument();
      expect(page.queryByText('Standard Error')).not.toBeInTheDocument();
    });

    it('shows the stream panels, unwarned, when the payload carries one', async () => {
      const page = render(<TestCases {...serverFilteredProps} stdout="out" />);

      expect(await page.findByText('Standard Output')).toBeVisible();
      expect(getWarning(page, 'Standard Output')).not.toBeInTheDocument();
    });
  });
});
