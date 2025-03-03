import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Container } from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import ReorderableTestCases from 'course/assessment/question/programming/components/common/ReorderableTestCases';
import {
  deleteTestCase,
  rearrangeTestCases,
} from 'course/assessment/question/programming/operations';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import LockableSection from './LockableSection';

interface TestCasesManagerProps {
  lockStates: { [key: string]: boolean };
  onToggleLock: (key: string) => void;
}

const TestCasesManager: FC<TestCasesManagerProps> = (props) => {
  const { t } = useTranslation();
  const { lockStates, onToggleLock } = props;

  const { control, setValue } = useFormContext<ProgrammingFormData>();
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
            control={control}
            disabled={lockStates[publicTestCasesName]}
            hintHeader={t(translations.hint)}
            lhsHeader={t(translations.expression)}
            name={publicTestCasesName}
            onDelete={(index: number) =>
              onDeletingTestCase(publicTestCasesName, index)
            }
            rhsHeader={t(translations.expected)}
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
            control={control}
            disabled={lockStates[privateTestCasesName]}
            hintHeader={t(translations.hint)}
            lhsHeader={t(translations.expression)}
            name={privateTestCasesName}
            onDelete={(index: number) =>
              onDeletingTestCase(privateTestCasesName, index)
            }
            rhsHeader={t(translations.expected)}
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
            control={control}
            disabled={lockStates[evaluationTestCasesName]}
            hintHeader={t(translations.hint)}
            lhsHeader={t(translations.expression)}
            name={evaluationTestCasesName}
            onDelete={(index: number) =>
              onDeletingTestCase(evaluationTestCasesName, index)
            }
            rhsHeader={t(translations.expected)}
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
