import { useState } from 'react';
import { Controller, FieldPathByValue } from 'react-hook-form';
import { Code, Delete } from '@mui/icons-material';
import {
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  JavaMetadataTestCase,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import EditorField from 'lib/components/core/fields/EditorField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import ExpressionField from './ExpressionField';
import { TestCaseProps } from './TestCase';
import TestCaseCell from './TestCaseCell';
import TestCaseRow from './TestCaseRow';

export type JavaTestCaseFieldPath = FieldPathByValue<
  ProgrammingFormData,
  JavaMetadataTestCase
>;

const JavaTestCase = (props: TestCaseProps): JSX.Element => {
  const { t } = useTranslation();

  const [showCode, setShowCode] = useState(true);

  return (
    <>
      <TestCaseRow header={props.id}>
        <TestCaseCell.Expression className="border-none">
          <Controller
            control={props.control}
            name={`${props.name}.expression`}
            render={({ field, fieldState: { error } }): JSX.Element => (
              <ExpressionField
                disabled={props.disabled}
                error={error?.message}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
        </TestCaseCell.Expression>

        <TestCaseCell.Expected className="border-none">
          <Controller
            control={props.control}
            name={`${props.name}.expected`}
            render={({ field, fieldState: { error } }): JSX.Element => (
              <ExpressionField
                disabled={props.disabled}
                error={error?.message}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
        </TestCaseCell.Expected>

        <TestCaseCell.Hint className="border-none">
          <Controller
            control={props.control}
            name={`${props.name}.hint`}
            render={({ field, fieldState: { error } }): JSX.Element => (
              <ExpressionField
                disabled={props.disabled}
                error={error?.message}
                onChange={field.onChange}
                plain
                value={field.value}
              />
            )}
          />
        </TestCaseCell.Hint>

        <TestCaseCell.Actions className="w-32 border-none">
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
        </TestCaseCell.Actions>
      </TestCaseRow>

      <TableRow>
        <TableCell className="h-fit px-2 py-0" colSpan={4}>
          <Collapse in={showCode}>
            <div className="mb-2 overflow-hidden rounded-lg border border-solid border-neutral-200">
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
        </TableCell>
      </TableRow>
    </>
  );
};

export default JavaTestCase;
