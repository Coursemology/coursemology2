import { ElementType, FC } from 'react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Container } from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import { ReorderableTestCaseProps } from 'course/assessment/question/programming/components/common/ReorderableTestCase';
import ReorderableTestCases from 'course/assessment/question/programming/components/common/ReorderableTestCases';
import {
  deleteTestCase,
  rearrangeTestCases,
} from 'course/assessment/question/programming/operations';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import LockableSection from '../LockableSection';
import { LockStates, ProgrammingPrototypeFormData } from '../types';

interface TestCasesManagerProps {
  control: Control<ProgrammingPrototypeFormData>;
  setValue: UseFormSetValue<ProgrammingPrototypeFormData>;
  lockStates: LockStates;
  onToggleLock: (key: string) => void;
  component?: ElementType<ReorderableTestCaseProps>;
  lhsHeader: string;
  rhsHeader: string;
}

const TestCasesManager: FC<TestCasesManagerProps> = (props) => {
  const { t } = useTranslation();
  const { component, lockStates, onToggleLock, lhsHeader, rhsHeader } = props;

  // Cast fields to ProgrammingFormData to satisfy helper components' type assertions
  const control = props.control as unknown as Control<ProgrammingFormData>;
  const setValue =
    props.setValue as unknown as UseFormSetValue<ProgrammingFormData>;

  const testCases = useWatch({ control, name: 'testUi.metadata.testCases' });

  const onRearrangingTestCases = (result: DropResult): void => {
    rearrangeTestCases(result, testCases, setValue);
  };

  const onDeletingTestCase = (type: string, index: number): void => {
    deleteTestCase(testCases, setValue, index, type);
  };

  const publicTestCasesName = 'testUi.metadata.testCases.public';
  const privateTestCasesName = 'testUi.metadata.testCases.private';
  const evaluationTestCasesName = 'testUi.metadata.testCases.evaluation';

  return (
    <DragDropContext onDragEnd={onRearrangingTestCases}>
      <LockableSection
        lockState={lockStates[publicTestCasesName]}
        lockStateKey={publicTestCasesName}
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <ReorderableTestCases
            component={component}
            control={control}
            disabled={lockStates[publicTestCasesName]}
            hintHeader={t(translations.hint)}
            lhsHeader={lhsHeader}
            name={publicTestCasesName}
            onDelete={(index: number) =>
              onDeletingTestCase(publicTestCasesName, index)
            }
            rhsHeader={rhsHeader}
            testCases={testCases.public}
            title={t(translations.publicTestCases)}
          />
        </Container>
      </LockableSection>

      <LockableSection
        lockState={lockStates[privateTestCasesName]}
        lockStateKey={privateTestCasesName}
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <ReorderableTestCases
            component={component}
            control={control}
            disabled={lockStates[privateTestCasesName]}
            hintHeader={t(translations.hint)}
            lhsHeader={lhsHeader}
            name={privateTestCasesName}
            onDelete={(index: number) =>
              onDeletingTestCase(privateTestCasesName, index)
            }
            rhsHeader={rhsHeader}
            subtitle={t(translations.privateTestCasesHint)}
            testCases={testCases.private}
            title={t(translations.privateTestCases)}
          />
        </Container>
      </LockableSection>

      <LockableSection
        lockState={lockStates[evaluationTestCasesName]}
        lockStateKey={evaluationTestCasesName}
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <ReorderableTestCases
            component={component}
            control={control}
            disabled={lockStates[evaluationTestCasesName]}
            hintHeader={t(translations.hint)}
            lhsHeader={lhsHeader}
            name={evaluationTestCasesName}
            onDelete={(index: number) =>
              onDeletingTestCase(evaluationTestCasesName, index)
            }
            rhsHeader={rhsHeader}
            subtitle={t(translations.evaluationTestCasesHint)}
            testCases={testCases.evaluation}
            title={t(translations.evaluationTestCases)}
          />
        </Container>
      </LockableSection>
    </DragDropContext>
  );
};

export default TestCasesManager;
