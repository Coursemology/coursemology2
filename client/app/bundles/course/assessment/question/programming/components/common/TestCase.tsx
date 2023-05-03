import { Control, Controller, FieldPathByValue } from 'react-hook-form';
import { Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import {
  MetadataTestCase,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import ExpressionField from './ExpressionField';
import TestCaseCell from './TestCaseCell';
import TestCaseRow from './TestCaseRow';

export type TestCaseFieldPath = FieldPathByValue<
  ProgrammingFormData,
  MetadataTestCase
>;

export interface TestCaseProps {
  control: Control<ProgrammingFormData>;
  name: TestCaseFieldPath;
  id?: string;
  onDelete?: () => void;
  disabled?: boolean;
}

const TestCase = (props: TestCaseProps): JSX.Element => (
  <TestCaseRow header={props.id}>
    <TestCaseCell.Expression>
      <Controller
        control={props.control}
        name={`${props.name}.expression`}
        render={({ field, fieldState: { error } }): JSX.Element => (
          <ExpressionField
            ref={field.ref}
            disabled={props.disabled}
            error={error?.message}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    </TestCaseCell.Expression>

    <TestCaseCell.Expected>
      <Controller
        control={props.control}
        name={`${props.name}.expected`}
        render={({ field, fieldState: { error } }): JSX.Element => (
          <ExpressionField
            ref={field.ref}
            disabled={props.disabled}
            error={error?.message}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    </TestCaseCell.Expected>

    <TestCaseCell.Hint>
      <Controller
        control={props.control}
        name={`${props.name}.hint`}
        render={({ field, fieldState: { error } }): JSX.Element => (
          <ExpressionField
            ref={field.ref}
            disabled={props.disabled}
            error={error?.message}
            onChange={field.onChange}
            plain
            value={field.value}
          />
        )}
      />
    </TestCaseCell.Hint>

    <TestCaseCell.Actions>
      <IconButton
        color="error"
        disabled={props.disabled}
        edge="end"
        onClick={props.onDelete}
      >
        <Delete />
      </IconButton>
    </TestCaseCell.Actions>
  </TestCaseRow>
);

export default TestCase;
