import { ElementType } from 'react';
import { FieldArrayPath, useFieldArray, useFormContext } from 'react-hook-form';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import Accordion from 'lib/components/core/layouts/Accordion';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import { StaticTestCasesTableProps } from './StaticTestCasesTable';
import TestCase, { TestCaseFieldPath, TestCaseProps } from './TestCase';

interface ReorderableTestCasesProps extends StaticTestCasesTableProps {
  onClickAdd?: () => void;
  name: FieldArrayPath<ProgrammingFormData>;
  byIdentifier?: (index: number) => string;
  as?: ElementType<TestCaseProps>;
  static?: boolean;
}

const ReorderableTestCases = (
  props: ReorderableTestCasesProps,
): JSX.Element => {
  const { byIdentifier, as: component, name, ...otherProps } = props;

  const TestCaseComponent = component ?? TestCase;

  const { t } = useTranslation();

  const { control } = useFormContext<ProgrammingFormData>();
  const { fields, append, remove } = useFieldArray({ control, name });

  const handleAddTestCase = (): void =>
    append({ expected: '', expression: '', hint: '' });

  return (
    <Accordion
      defaultExpanded
      disabled={otherProps.disabled}
      disableGutters
      subtitle={otherProps.subtitle}
      title={otherProps.title}
    >
      <Button
        className="ml-3"
        disabled={otherProps.disabled}
        onClick={handleAddTestCase}
        size="small"
        startIcon={<Add />}
      >
        {t(translations.addTestCase)}
      </Button>

      {fields.map((field, index) => (
        <TestCaseComponent
          key={field.id}
          control={control}
          disabled={otherProps.disabled}
          id={byIdentifier?.(index)}
          name={`${name}.${index}` as TestCaseFieldPath}
          onDelete={!props.static ? (): void => remove(index) : undefined}
          {...otherProps}
        />
      ))}
    </Accordion>
  );
};

export default ReorderableTestCases;
