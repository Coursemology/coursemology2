import { mount } from 'enzyme';

import { VisibleTestCaseView } from 'course/assessment/submission/containers/TestCaseView';
import Providers from 'lib/components/wrappers/Providers';

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

const publicTestCases = '#publicTestCases';
const privateTestCases = '#privateTestCases';
const evaluationTestCases = '#evaluationTestCases';
const standardOutput = '#standardOutput';
const standardError = '#standardError';
const privateWarningIcon = '#warning-icon-private-test-cases';
const evaluationWarningIcon = '#warning-icon-evaluation-test-cases';
const standardErrorWarningIcon = '#warning-icon-standard-error';
const standardOutputWarningIcon = '#warning-icon-standard-output';

describe('TestCaseView', () => {
  describe('when viewing as staff', () => {
    it('renders all test cases and standard streams', () => {
      const testCaseView = mount(
        <Providers>
          <VisibleTestCaseView {...defaultStaffViewProps} />
        </Providers>,
      );

      expect(testCaseView.find(publicTestCases).exists()).toBe(true);
      expect(testCaseView.find(privateTestCases).exists()).toBe(true);
      expect(testCaseView.find(evaluationTestCases).exists()).toBe(true);
      expect(testCaseView.find(standardOutput).exists()).toBe(true);
      expect(testCaseView.find(standardError).exists()).toBe(true);
    });

    it('renders staff-only warnings', () => {
      const testCaseView = mount(
        <Providers>
          <VisibleTestCaseView {...defaultStaffViewProps} />
        </Providers>,
      );

      expect(testCaseView.find(privateWarningIcon).exists()).toBe(true);
      expect(testCaseView.find(evaluationWarningIcon).exists()).toBe(true);
      expect(testCaseView.find(standardOutputWarningIcon).exists()).toBe(true);
      expect(testCaseView.find(standardErrorWarningIcon).exists()).toBe(true);
    });

    describe('when showEvaluation & showPrivate are true', () => {
      it('renders staff-only warnings when assessment is not yet published', () => {
        const testCaseView = mount(
          <Providers>
            <VisibleTestCaseView
              {...defaultStaffViewProps}
              showEvaluation
              showPrivate
              submissionState={workflowStates.Attempting}
            />
          </Providers>,
        );

        expect(testCaseView.find(privateWarningIcon).exists()).toBe(true);
        expect(testCaseView.find(evaluationWarningIcon).exists()).toBe(true);
      });

      it('does not render staff-only warnings when assessment is published', () => {
        const testCaseView = mount(
          <Providers>
            <VisibleTestCaseView
              {...defaultStaffViewProps}
              showEvaluation
              showPrivate
            />
          </Providers>,
        );

        expect(testCaseView.find(privateWarningIcon).exists()).toBe(false);
        expect(testCaseView.find(evaluationWarningIcon).exists()).toBe(false);
      });
    });

    describe('when students can see standard streams', () => {
      it('does not render staff-only warnings', () => {
        const testCaseView = mount(
          <Providers>
            <VisibleTestCaseView
              {...defaultStaffViewProps}
              showStdoutAndStderr
            />
          </Providers>,
        );

        expect(testCaseView.find(standardOutputWarningIcon).exists()).toBe(
          false,
        );
        expect(testCaseView.find(standardErrorWarningIcon).exists()).toBe(
          false,
        );
      });
    });
  });

  describe('when viewing as student', () => {
    it('does not show any staff-only warnings', () => {
      const testCaseView = mount(
        <Providers>
          <VisibleTestCaseView
            {...defaultTestCaseViewProps}
            showEvaluation
            showPrivate
            showStdoutAndStderr
          />
        </Providers>,
      );

      expect(testCaseView.find(privateWarningIcon).exists()).toBe(false);
      expect(testCaseView.find(evaluationWarningIcon).exists()).toBe(false);
      expect(testCaseView.find(standardOutputWarningIcon).exists()).toBe(false);
      expect(testCaseView.find(standardErrorWarningIcon).exists()).toBe(false);
    });

    it('shows standard streams when the flag is enabled', () => {
      const testCaseView = mount(
        <Providers>
          <VisibleTestCaseView
            {...defaultTestCaseViewProps}
            showStdoutAndStderr
          />
        </Providers>,
      );

      expect(testCaseView.find(standardOutput).exists()).toBe(true);
      expect(testCaseView.find(standardError).exists()).toBe(true);
    });

    describe('when showEvaluation & showPrivate flags are enabled', () => {
      it('shows private and evaluation tests after assessment is published', () => {
        const testCaseView = mount(
          <Providers>
            <VisibleTestCaseView
              {...defaultTestCaseViewProps}
              showEvaluation
              showPrivate
            />
          </Providers>,
        );

        expect(testCaseView.find(privateTestCases).exists()).toBe(true);
        expect(testCaseView.find(evaluationTestCases).exists()).toBe(true);
      });

      it('does not show private and evaluation tests before assessment is published', () => {
        const testCaseView = mount(
          <Providers>
            <VisibleTestCaseView
              {...defaultTestCaseViewProps}
              showEvaluation
              showPrivate
              submissionState={workflowStates.Attempting}
            />
          </Providers>,
        );

        expect(testCaseView.find(privateTestCases).exists()).toBe(false);
        expect(testCaseView.find(evaluationTestCases).exists()).toBe(false);
      });
    });
  });
});
