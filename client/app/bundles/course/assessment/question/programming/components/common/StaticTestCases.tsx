import { FieldArrayPath, useFieldArray, useFormContext } from 'react-hook-form';
import { TableCell, TableRow, Typography } from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import StaticTestCase from './StaticTestCase';
import StaticTestCasesTable, {
  StaticTestCasesTableProps,
} from './StaticTestCasesTable';
import { TestCaseFieldPath } from './TestCase';

interface TestCasesProps extends StaticTestCasesTableProps {
  name: FieldArrayPath<ProgrammingFormData>;
  byIdentifier?: (index: number) => string;
  static?: boolean;
}

const StaticTestCases = (props: TestCasesProps): JSX.Element => {
  const { byIdentifier, name, ...otherProps } = props;

  const { t } = useTranslation();

  const { control } = useFormContext<ProgrammingFormData>();
  const { fields } = useFieldArray({ control, name });

  return (
    <StaticTestCasesTable {...otherProps}>
      {fields.map((field, index) => (
        <StaticTestCase
          key={field.id}
          control={control}
          disabled={props.disabled}
          id={byIdentifier?.(index)}
          name={`${name}.${index}` as TestCaseFieldPath}
          {...otherProps}
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
    </StaticTestCasesTable>
  );
};

export default StaticTestCases;
