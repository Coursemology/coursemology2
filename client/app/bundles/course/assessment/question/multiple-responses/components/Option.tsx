import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Delete, DragIndicator, Undo } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { produce } from 'immer';
import { OptionEntity } from 'types/course/assessment/question/multiple-responses';

import Checkbox from 'lib/components/core/buttons/Checkbox';
import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import useDirty from '../../commons/useDirty';
import { McqMrqAdapter } from '../commons/translationAdapter';
import { OptionErrors } from '../commons/validations';

interface OptionProps {
  for: OptionEntity;
  index: number;
  onDeleteDraft: () => void;
  adapter: McqMrqAdapter;
  onDirtyChange: (isDirty: boolean) => void;
  allowRandomization?: boolean;
  hideCorrect?: boolean;
  disabled?: boolean;
}

export interface OptionRef {
  getOption: () => OptionEntity;
  reset: () => void;
  resetError: () => void;
  setError: (error: OptionErrors) => void;
}

const Option = forwardRef<OptionRef, OptionProps>((props, ref): JSX.Element => {
  const { disabled, adapter: texts, for: originalOption } = props;

  const [option, setOption] = useState(originalOption);
  const [toBeDeleted, setToBeDeleted] = useState(false);
  const [error, setError] = useState<OptionErrors>();

  const { isDirty, mark, reset } = useDirty<keyof OptionEntity>();

  const { t } = useTranslation();

  useEffect(() => {
    // Only update if the option ID changed (different option)
    if (option.id !== originalOption.id) setOption(originalOption);
  }, [originalOption.id]);

  useImperativeHandle(ref, () => ({
    getOption: () => option,
    reset: (): void => {
      setOption(originalOption);
      setToBeDeleted(false);
      reset();
    },
    setError,
    resetError: () => setError(undefined),
  }));

  useEffect(() => {
    props.onDirtyChange(isDirty);
  }, [isDirty]);

  const update = <T extends keyof OptionEntity>(
    field: T,
    value: OptionEntity[T],
  ): void => {
    setOption(
      produce((draft) => {
        draft[field] = value;
      }),
    );

    mark(field, originalOption[field] !== value);
  };

  const handleDelete = (): void => {
    if (!option.draft) {
      update('toBeDeleted', true);
      setToBeDeleted(true);
    } else {
      props.onDeleteDraft();
    }
  };

  const undoDelete = (): void => {
    if (option.draft) return;

    update('toBeDeleted', undefined);
    setToBeDeleted(false);
  };

  return (
    <Draggable
      draggableId={`option-${option.id}`}
      index={props.index}
      isDragDisabled={disabled}
    >
      {(draggable, { isDragging }): JSX.Element => (
        <section
          ref={draggable.innerRef}
          {...draggable.draggableProps}
          className={`flex border-0 border-b border-solid border-neutral-200 last:border-b-0 ${
            toBeDeleted ? 'border-neutral-300 bg-neutral-200' : ''
          } ${option.draft ? 'bg-lime-50' : ''} ${
            isDragging ? 'rounded-lg border-b-0 bg-white drop-shadow-md' : ''
          }`}
        >
          <div
            {...draggable.dragHandleProps}
            className="min-w-[44px] space-y-4 py-4 pl-4"
          >
            {!props.hideCorrect && (
              <Tooltip disableInteractive title={texts.markAsCorrect}>
                <Checkbox
                  checked={option.correct}
                  disabled={toBeDeleted || isDragging || disabled}
                  labelClassName="mr-0"
                  onChange={(_, checked): void => update('correct', checked)}
                />
              </Tooltip>
            )}

            {!disabled && <DragIndicator color="disabled" fontSize="small" />}
          </div>

          <div className="mt-1 flex w-[calc(100%_-_84px)] flex-col space-y-4 py-4">
            <CKEditorRichText
              autofocus={option.draft}
              disabled={toBeDeleted || isDragging || disabled}
              disableMargins
              error={error?.option && formatErrorMessage(error.option)}
              label={texts.option}
              name="option"
              onChange={(value): void => update('option', value)}
              placeholder={texts.option}
              value={option.option}
            />

            {toBeDeleted ? (
              <Typography className="italic text-neutral-500" variant="body2">
                {texts.willBeDeleted}
              </Typography>
            ) : (
              <>
                <CKEditorRichText
                  disabled={toBeDeleted || isDragging || disabled}
                  disableMargins
                  inputId={`option-${option.id}-explanation`}
                  label={t(translations.explanation)}
                  name="explanation"
                  onChange={(explanation): void =>
                    update('explanation', explanation)
                  }
                  placeholder={t(translations.explanation)}
                  value={option.explanation ?? ''}
                />

                {props.allowRandomization && (
                  <Checkbox
                    checked={option.ignoreRandomization}
                    disabled={toBeDeleted || isDragging || disabled}
                    label={t(translations.ignoresRandomization)}
                    onChange={(_, checked): void =>
                      update('ignoreRandomization', checked)
                    }
                    size="small"
                  />
                )}
              </>
            )}

            {option.draft && (
              <Typography className="italic text-neutral-500" variant="body2">
                {texts.newCannotUndoDelete}
              </Typography>
            )}
          </div>

          <div className="py-4">
            {toBeDeleted ? (
              <Tooltip title={texts.undoDelete}>
                <IconButton
                  color="info"
                  disabled={isDragging || disabled}
                  onClick={undoDelete}
                >
                  <Undo />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title={texts.delete}>
                <IconButton
                  color="error"
                  disabled={isDragging || disabled}
                  onClick={handleDelete}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </section>
      )}
    </Draggable>
  );
});

Option.displayName = 'Option';

export default Option;
