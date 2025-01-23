import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import { rearrangeTestCases } from '../operations';

import ReorderableTestCases, {
  ReorderableTestCasesProps,
} from './common/ReorderableTestCases';

export interface ReorderableTestCasesManagerProps
  extends Omit<
    ReorderableTestCasesProps,
    'testCases' | 'hintHeader' | 'title' | 'control'
  > {}

const ReorderableTestCasesManager: FC<ReorderableTestCasesManagerProps> = (
  props,
) => {
  const { t } = useTranslation();
  const { component, disabled, lhsHeader, rhsHeader } = props;
  const { control, setValue } = useFormContext<ProgrammingFormData>();

  const testCases = useWatch({ control, name: 'testUi.metadata.testCases' });

  const onRearrangingTestCases = (result: DropResult): void => {
    rearrangeTestCases(result, testCases, setValue);
  };

  return (
    <DragDropContext onDragEnd={onRearrangingTestCases}>
      <ReorderableTestCases
        component={component}
        control={control}
        disabled={disabled}
        hintHeader={t(translations.hint)}
        lhsHeader={lhsHeader}
        name="testUi.metadata.testCases.public"
        rhsHeader={rhsHeader}
        testCases={testCases?.public ?? []}
        title={t(translations.publicTestCases)}
      />

      <ReorderableTestCases
        component={component}
        control={control}
        disabled={props.disabled}
        hintHeader={t(translations.hint)}
        lhsHeader={lhsHeader}
        name="testUi.metadata.testCases.private"
        rhsHeader={rhsHeader}
        subtitle={t(translations.privateTestCasesHint)}
        testCases={testCases?.private ?? []}
        title={t(translations.privateTestCases)}
      />

      <ReorderableTestCases
        component={component}
        control={control}
        disabled={props.disabled}
        hintHeader={t(translations.hint)}
        lhsHeader={lhsHeader}
        name="testUi.metadata.testCases.evaluation"
        rhsHeader={rhsHeader}
        subtitle={t(translations.evaluationTestCasesHint)}
        testCases={testCases?.evaluation ?? []}
        title={t(translations.evaluationTestCases)}
      />
    </DragDropContext>
  );
};

export default ReorderableTestCasesManager;
