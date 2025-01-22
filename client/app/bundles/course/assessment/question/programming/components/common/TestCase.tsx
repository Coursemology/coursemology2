import { Control, Controller, FieldPathByValue } from 'react-hook-form';
import { Delete, DragIndicator } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import {
  MetadataTestCase,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import ExpressionField from './ExpressionField';
import { StaticTestCasesTableProps } from './StaticTestCasesTable';

export type TestCaseFieldPath = FieldPathByValue<
  ProgrammingFormData,
  MetadataTestCase
>;

export interface TestCaseProps extends StaticTestCasesTableProps {
  control: Control<ProgrammingFormData>;
  name: TestCaseFieldPath;
  onDelete?: () => void;
  disabled?: boolean;
}

const TestCase = (props: TestCaseProps): JSX.Element => (
  <div className="border-solid border-0 border-t border-neutral-200 ">
    <section className="w-full flex flex-row align-center space-x-2 mt-2 mb-2">
      <IconButton className="-mr-2" disabled>
        <DragIndicator color="disabled" />
      </IconButton>

      <Controller
        control={props.control}
        name={`${props.name}.expression`}
        render={({ field, fieldState: { error } }): JSX.Element => (
          <ExpressionField
            disabled={props.disabled}
            error={error?.message}
            label={props.lhsHeader}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />

      <Controller
        control={props.control}
        name={`${props.name}.expected`}
        render={({ field, fieldState: { error } }): JSX.Element => (
          <ExpressionField
            disabled={props.disabled}
            error={error?.message}
            label={props.rhsHeader}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />

      <Controller
        control={props.control}
        name={`${props.name}.hint`}
        render={({ field, fieldState: { error } }): JSX.Element => (
          <ExpressionField
            disabled={props.disabled}
            error={error?.message}
            label={props.hintHeader}
            onChange={field.onChange}
            plain
            value={field.value}
          />
        )}
      />

      <IconButton
        color="error"
        disabled={props.disabled}
        edge="end"
        onClick={props.onDelete}
      >
        <Delete />
      </IconButton>
    </section>
  </div>
);

export default TestCase;
