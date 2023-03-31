import { mount } from 'enzyme';

import { VisibleTestCaseView } from 'course/assessment/submission/containers/TestCaseView';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

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
const warningIcon = 'warning-icon';

describe('TestCaseView', () => {
  describe('when viewing as staff', () => {
    it('renders all test cases and standard streams', () => {
      const testCaseView = mount(
        <ProviderWrapper>
          <VisibleTestCaseView {...defaultStaffViewProps} />
        </ProviderWrapper>,
      );

      expect(testCaseView.find(publicTestCases).exists()).toBe(true);
      expect(testCaseView.find(privateTestCases).exists()).toBe(true);
      expect(testCaseView.find(evaluationTestCases).exists()).toBe(true);
      expect(testCaseView.find(standardOutput).exists()).toBe(true);
      expect(testCaseView.find(standardError).exists()).toBe(true);
    });

    it('renders staff-only warnings', () => {
      const testCaseView = mount(
        <ProviderWrapper>
          <VisibleTestCaseView {...defaultStaffViewProps} />
        </ProviderWrapper>,
      );

      expect(
        testCaseView.find(privateTestCases).getByTestId(warningIcon),
      ).toBeVisible();
      expect(
        testCaseView.find(evaluationTestCases).getByTestId(warningIcon),
      ).toBeVisible();
      expect(
        testCaseView.find(standardOutput).getByTestId(warningIcon),
      ).toBeVisible();
      expect(
        testCaseView.find(standardError).getByTestId(warningIcon),
      ).toBeVisible();
    });

    describe('when showEvaluation & showPrivate are true', () => {
      it('renders staff-only warnings when assessment is not yet published', () => {
        const testCaseView = mount(
          <ProviderWrapper>
            <VisibleTestCaseView
              {...defaultStaffViewProps}
              showEvaluation
              showPrivate
              submissionState={workflowStates.Attempting}
            />
          </ProviderWrapper>,
        );

        expect(
          testCaseView.find(privateTestCases).getByTestId(warningIcon),
        ).toBeVisible();
        expect(
          testCaseView.find(evaluationTestCases).getByTestId(warningIcon),
        ).toBeVisible();
      });

      it('does not render staff-only warnings when assessment is published', () => {
        const testCaseView = mount(
          <ProviderWrapper>
            <VisibleTestCaseView
              {...defaultStaffViewProps}
              showEvaluation
              showPrivate
            />
          </ProviderWrapper>,
        );

        expect(
          testCaseView.find(privateTestCases).getByTestId(warningIcon),
        ).not.toBeVisible();
        expect(
          testCaseView.find(evaluationTestCases).getByTestId(warningIcon),
        ).not.toBeVisible();
      });
    });

    describe('when students can see standard streams', () => {
      it('does not render staff-only warnings', () => {
        const testCaseView = mount(
          <ProviderWrapper>
            <VisibleTestCaseView
              {...defaultStaffViewProps}
              showStdoutAndStderr
            />
          </ProviderWrapper>,
        );

        expect(
          testCaseView.find(standardOutput).getByTestId(warningIcon),
        ).not.toBeVisible();
        expect(
          testCaseView.find(standardError).getByTestId(warningIcon),
        ).not.toBeVisible();
      });
    });
  });

  describe('when viewing as student', () => {
    it('does not show any staff-only warnings', () => {
      const testCaseView = mount(
        <ProviderWrapper>
          <VisibleTestCaseView
            {...defaultTestCaseViewProps}
            showEvaluation
            showPrivate
            showStdoutAndStderr
          />
        </ProviderWrapper>,
      );

      expect(testCaseView.getByTestId(warningIcon)).not.toBeVisible();
    });

    it('shows standard streams when the flag is enabled', () => {
      const testCaseView = mount(
        <ProviderWrapper>
          <VisibleTestCaseView
            {...defaultTestCaseViewProps}
            showStdoutAndStderr
          />
        </ProviderWrapper>,
      );

      expect(testCaseView.find(standardOutput).exists()).toBe(true);
      expect(testCaseView.find(standardError).exists()).toBe(true);
    });

    describe('when showEvaluation & showPrivate flags are enabled', () => {
      it('shows private and evaluation tests after assessment is published', () => {
        const testCaseView = mount(
          <ProviderWrapper>
            <VisibleTestCaseView
              {...defaultTestCaseViewProps}
              showEvaluation
              showPrivate
            />
          </ProviderWrapper>,
        );

        expect(testCaseView.find(privateTestCases).exists()).toBe(true);
        expect(testCaseView.find(evaluationTestCases).exists()).toBe(true);
      });

      it('does not show private and evaluation tests before assessment is published', () => {
        const testCaseView = mount(
          <ProviderWrapper>
            <VisibleTestCaseView
              {...defaultTestCaseViewProps}
              showEvaluation
              showPrivate
              submissionState={workflowStates.Attempting}
            />
          </ProviderWrapper>,
        );

        expect(testCaseView.find(privateTestCases).exists()).toBe(false);
        expect(testCaseView.find(evaluationTestCases).exists()).toBe(false);
      });
    });
  });
});
