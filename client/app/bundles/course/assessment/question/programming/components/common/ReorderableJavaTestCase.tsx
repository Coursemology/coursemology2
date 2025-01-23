import { useState } from 'react';
import { Controller, FieldPathByValue } from 'react-hook-form';
import { Draggable } from '@hello-pangea/dnd';
import { Code, Delete, DragIndicator } from '@mui/icons-material';
import { Collapse, IconButton, Tooltip } from '@mui/material';
import {
  JavaMetadataTestCase,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import EditorField from 'lib/components/core/fields/EditorField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import ExpressionField from './ExpressionField';
import { ReorderableTestCaseProps } from './ReorderableTestCase';

export type JavaTestCaseFieldPath = FieldPathByValue<
  ProgrammingFormData,
  JavaMetadataTestCase
>;

const ReorderableJavaTestCase = (
  props: ReorderableTestCaseProps,
): JSX.Element => {
  const { name } = props;
  const { t } = useTranslation();

  const index = parseInt(name.split('.').pop() ?? '0', 10);

  const [showCode, setShowCode] = useState(true);

  return (
    <Draggable key={name} draggableId={name} index={index}>
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

            <div className="flex">
              <span className="relative overflow-visible">
                {showCode && (
                  <div className="absolute left-0 top-0 h-[calc(100%_+_0.7rem)] w-full rounded-t-lg border border-solid border-neutral-200 bg-white pt-2" />
                )}

                <Controller
                  control={props.control}
                  name={`${props.name}.inlineCode` as JavaTestCaseFieldPath}
                  render={({ field }): JSX.Element => (
                    <Tooltip
                      disableInteractive
                      title={t(translations.inlineCode)}
                    >
                      <IconButton
                        color={field.value ? 'primary' : undefined}
                        disabled={props.disabled}
                        onClick={(): void => setShowCode((value) => !value)}
                      >
                        <Code />
                      </IconButton>
                    </Tooltip>
                  )}
                />
              </span>

              <IconButton
                color="error"
                disabled={props.disabled}
                edge="end"
                onClick={props.onDelete}
              >
                <Delete />
              </IconButton>
            </div>
          </section>

          <Collapse
            className="ml-3 mr-3 mb-2 border border-t border-solid border-neutral-200 rounded-lg"
            in={showCode}
          >
            <div className="overflow-hidden rounded-lg border-none">
              <Controller
                control={props.control}
                name={`${props.name}.inlineCode` as JavaTestCaseFieldPath}
                render={({ field }): JSX.Element => (
                  <EditorField
                    disabled={props.disabled}
                    height="7rem"
                    language="java"
                    onChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
            </div>
          </Collapse>
        </div>
      )}
    </Draggable>
  );
};

export default ReorderableJavaTestCase;
