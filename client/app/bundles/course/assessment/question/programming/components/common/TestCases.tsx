import { ElementType } from 'react';
import { FieldArrayPath, useFieldArray, useFormContext } from 'react-hook-form';
import { TableCell, TableRow, Typography } from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import TestCase, { TestCaseFieldPath, TestCaseProps } from './TestCase';
import TestCasesTable, { TestCasesTableProps } from './TestCasesTable';

interface TestCasesProps extends TestCasesTableProps {
  name: FieldArrayPath<ProgrammingFormData>;
  byIdentifier?: (index: number) => string;
  as?: ElementType<TestCaseProps>;
  static?: boolean;
}

const TestCases = (props: TestCasesProps): JSX.Element => {
  const { byIdentifier, as: component, name, ...otherProps } = props;

  const TestCaseComponent = component ?? TestCase;

  const { t } = useTranslation();

  const { control } = useFormContext<ProgrammingFormData>();
  const { fields, append, remove } = useFieldArray({ control, name });

  const handleAddTestCase = (): void =>
    append({ expected: '', expression: '', hint: '' });

  return (
    <TestCasesTable
      {...otherProps}
      onClickAdd={!props.static ? handleAddTestCase : undefined}
    >
      {fields.map((field, index) => (
        <TestCaseComponent
          key={field.id}
          control={control}
          disabled={props.disabled}
          id={byIdentifier?.(index)}
          name={`${name}.${index}` as TestCaseFieldPath}
          onDelete={!props.static ? (): void => remove(index) : undefined}
        />
      ))}

      {!fields.length && (
        <TableRow>
          <TableCell colSpan={!props.static ? 4 : 3}>
            <Typography align="center" color="text.secondary" variant="body2">
              {!props.static
                ? t(translations.addTestCaseToBegin)
                : t(translations.noTestCases)}
            </Typography>
          </TableCell>
        </TableRow>
      )}
    </TestCasesTable>
  );
};

export default TestCases;
