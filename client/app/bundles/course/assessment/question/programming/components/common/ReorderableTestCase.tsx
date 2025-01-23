import { Control, Controller, FieldPathByValue } from 'react-hook-form';
import { Draggable } from '@hello-pangea/dnd';
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

export interface ReorderableTestCaseProps extends StaticTestCasesTableProps {
  control: Control<ProgrammingFormData>;
  name: TestCaseFieldPath;
  onDelete?: () => void;
  disabled?: boolean;
}

const ReorderableTestCase = (props: ReorderableTestCaseProps): JSX.Element => {
  const index = parseInt(props.name.split('.').pop() ?? '0', 10);
  return (
    <Draggable key={props.name} draggableId={props.name} index={index}>
      {(provided): JSX.Element => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="border-solid border-0 border-t border-neutral-200"
        >
          <section className="w-full flex flex-row align-center space-x-2 mt-2 mb-2">
            <div>
              <IconButton {...provided.dragHandleProps} className="-mr-2">
                <DragIndicator color="disabled" />
              </IconButton>
            </div>

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
      )}
    </Draggable>
  );
};

export default ReorderableTestCase;
