import { ElementType } from 'react';
import { Control, FieldArrayPath, useFieldArray } from 'react-hook-form';
import { Droppable } from '@hello-pangea/dnd';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import {
  JavaMetadataTestCase,
  MetadataTestCase,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import Accordion from 'lib/components/core/layouts/Accordion';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import ReorderableTestCase, {
  ReorderableTestCaseProps,
  TestCaseFieldPath,
} from './ReorderableTestCase';
import { StaticTestCasesTableProps } from './StaticTestCasesTable';

export interface ReorderableTestCasesProps extends StaticTestCasesTableProps {
  onClickAdd?: () => void;
  control: Control<ProgrammingFormData>;
  name: FieldArrayPath<ProgrammingFormData>;
  byIdentifier?: (index: number) => string;
  component?: ElementType<ReorderableTestCaseProps>;
  static?: boolean;
  testCases: MetadataTestCase[] | JavaMetadataTestCase[];
}

const ReorderableTestCases = (
  props: ReorderableTestCasesProps,
): JSX.Element => {
  const {
    byIdentifier,
    component,
    name,
    testCases,
    control,
    disabled,
    ...otherProps
  } = props;

  const TestCaseComponent = component ?? ReorderableTestCase;

  const { t } = useTranslation();

  const { append, remove } = useFieldArray({
    control,
    name,
  });

  const droppableId = name.split('.').pop() ?? '';

  // we type-casted the element to be appended as JavaMetadataTestCase because it implements
  // all types of other test cases as well (only difference is this type has inlineCode, which
  // other type doesn't have)
  const handleAddTestCase = (): void =>
    append({
      expected: '',
      expression: '',
      hint: '',
      inlineCode: '',
    } as JavaMetadataTestCase);

  return (
    <Accordion
      defaultExpanded
      disabled={disabled}
      disableGutters
      subtitle={otherProps.subtitle}
      title={otherProps.title}
    >
      <Droppable key={droppableId} droppableId={droppableId}>
        {(provided): JSX.Element => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <Button
              aria-label={t(translations.addTestCase)}
              className="ml-3"
              disabled={disabled}
              onClick={handleAddTestCase}
              size="small"
              startIcon={<Add />}
            >
              {t(translations.addTestCase)}
            </Button>
            {testCases.map((field, index) => (
              <TestCaseComponent
                key={field.id}
                control={control}
                disabled={disabled}
                id={byIdentifier?.(index)}
                name={`${name}.${index}` as TestCaseFieldPath}
                onDelete={!props.static ? (): void => remove(index) : undefined}
                {...otherProps}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Accordion>
  );
};

export default ReorderableTestCases;
