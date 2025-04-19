/* eslint-disable sonarjs/no-duplicate-string */
import { render, waitFor, within } from 'test-utils';

import { VisibleTestCaseView } from 'course/assessment/submission/containers/TestCaseView';

import { workflowStates } from '../../../constants';

const defaultTestCaseViewProps = {
  submissionState: workflowStates.Published,
  graderView: false,
  showPublicTestCasesOutput: false,
  showStdoutAndStderr: false,
  showPrivate: false,
  showEvaluation: false,
  isAutograding: false,
  collapsible: false,
  testCases: {
    canReadTests: false,
    public_test: [
      {
        identifier: 'public_test_1_identifier',
        expression: 'public_test_1_expression',
        expected: 'public_test_1_expected',
      },
    ],
    private_test: [
      {
        identifier: 'private_test_1_identifier',
        expression: 'private_test_1_expression',
        expected: 'private_test_1_expected',
      },
    ],
    evaluation_test: [
      {
        identifier: 'evaluation_test_1_identifier',
        expression: 'evaluation_test_1_expression',
        expected: 'evaluation_test_1_expected',
      },
    ],
    stdout: 'stdout',
    stderr: 'stderr',
  },
};

const defaultStaffViewProps = {
  ...defaultTestCaseViewProps,
  graderView: true,
  testCases: {
    ...defaultTestCaseViewProps.testCases,
    canReadTests: true,
  },
};

const getWarning = (page, text) =>
  within(page.getByText(text).closest('div')).queryByText(
    'Only staff can see this.',
    { exact: false },
  );

describe('TestCaseView', () => {
  describe('when viewing as staff', () => {
    it('renders all test cases and standard streams', async () => {
      const page = render(<VisibleTestCaseView {...defaultStaffViewProps} />);

      expect(await page.findByText('Public Test Cases')).toBeVisible();
      expect(page.getByText('Private Test Cases')).toBeVisible();
      expect(page.getByText('Evaluation Test Cases')).toBeVisible();
      expect(page.getByText('Standard Output')).toBeVisible();
      expect(page.getByText('Standard Error')).toBeVisible();
    });

    it('renders staff-only warnings', async () => {
      const page = render(<VisibleTestCaseView {...defaultStaffViewProps} />);

      await waitFor(() => {
        expect(getWarning(page, 'Private Test Cases')).toBeVisible();
        expect(getWarning(page, 'Evaluation Test Cases')).toBeVisible();
        expect(getWarning(page, 'Standard Output')).toBeVisible();
        expect(getWarning(page, 'Standard Error')).toBeVisible();
      });
    });

    describe('when showEvaluation & showPrivate are true', () => {
      it('renders staff-only warnings when assessment is not yet published', async () => {
        const page = render(
          <VisibleTestCaseView
            {...defaultStaffViewProps}
            showEvaluation
            showPrivate
            submissionState={workflowStates.Attempting}
          />,
        );

        await waitFor(() => {
          expect(getWarning(page, 'Private Test Cases')).toBeVisible();
          expect(getWarning(page, 'Evaluation Test Cases')).toBeVisible();
        });
      });

      it('does not render staff-only warnings when assessment is published', async () => {
        const page = render(
          <VisibleTestCaseView
            {...defaultStaffViewProps}
            showEvaluation
            showPrivate
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
          <VisibleTestCaseView
            {...defaultStaffViewProps}
            showStdoutAndStderr
          />,
        );

        await waitFor(() => {
          expect(getWarning(page, 'Standard Output')).not.toBeInTheDocument();
          expect(getWarning(page, 'Standard Error')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('when viewing as student', () => {
    it('does not show any staff-only warnings', async () => {
      const page = render(
        <VisibleTestCaseView
          {...defaultTestCaseViewProps}
          showEvaluation
          showPrivate
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
        <VisibleTestCaseView
          {...defaultTestCaseViewProps}
          showStdoutAndStderr
        />,
      );

      expect(await page.findByText('Standard Output')).toBeVisible();
      expect(page.getByText('Standard Error')).toBeVisible();
    });

    describe('when showEvaluation & showPrivate flags are enabled', () => {
      it('shows private and evaluation tests after assessment is published', async () => {
        const page = render(
          <VisibleTestCaseView
            {...defaultTestCaseViewProps}
            showEvaluation
            showPrivate
          />,
        );

        expect(await page.findByText('Private Test Cases')).toBeVisible();
        expect(page.getByText('Evaluation Test Cases')).toBeVisible();
      });

      it('does not show private and evaluation tests before assessment is published', async () => {
        const page = render(
          <VisibleTestCaseView
            {...defaultTestCaseViewProps}
            showEvaluation
            showPrivate
            submissionState={workflowStates.Attempting}
          />,
        );

        await waitFor(() => {
          expect(
            page.queryByText('Private Test Cases'),
          ).not.toBeInTheDocument();
          expect(
            page.queryByText('Evaluation Test Cases'),
          ).not.toBeInTheDocument();
        });
      });
    });
  });
});
