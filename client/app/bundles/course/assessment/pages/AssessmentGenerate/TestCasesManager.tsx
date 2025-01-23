import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Container } from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import ReorderableTestCases from 'course/assessment/question/programming/components/common/ReorderableTestCases';
import { rearrangeTestCases } from 'course/assessment/question/programming/operations';
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

  return (
    <DragDropContext onDragEnd={onRearrangingTestCases}>
      <LockableSection
        lockState={lockStates['testUi.metadata.testCases.public']}
        lockStateKey="testUi.metadata.testCases.public"
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <ReorderableTestCases
            control={control}
            disabled={lockStates['testUi.metadata.testCases.public']}
            hintHeader={t(translations.hint)}
            lhsHeader={t(translations.expression)}
            name="testUi.metadata.testCases.public"
            rhsHeader={t(translations.expected)}
            testCases={testCases.public}
            title={t(translations.publicTestCases)}
          />
        </Container>
      </LockableSection>

      <LockableSection
        lockState={lockStates['testUi.metadata.testCases.private']}
        lockStateKey="testUi.metadata.testCases.private"
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <ReorderableTestCases
            control={control}
            disabled={lockStates['testUi.metadata.testCases.private']}
            hintHeader={t(translations.hint)}
            lhsHeader={t(translations.expression)}
            name="testUi.metadata.testCases.private"
            rhsHeader={t(translations.expected)}
            subtitle={t(translations.privateTestCasesHint)}
            testCases={testCases.private}
            title={t(translations.privateTestCases)}
          />
        </Container>
      </LockableSection>

      <LockableSection
        lockState={lockStates['testUi.metadata.testCases.evaluation']}
        lockStateKey="testUi.metadata.testCases.evaluation"
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <ReorderableTestCases
            control={control}
            disabled={lockStates['testUi.metadata.testCases.evaluation']}
            hintHeader={t(translations.hint)}
            lhsHeader={t(translations.expression)}
            name="testUi.metadata.testCases.evaluation"
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
