import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Add } from '@mui/icons-material';
import { Button, Paper, Typography } from '@mui/material';
import produce from 'immer';
import { OptionEntity } from 'types/course/assessment/multiple-responses';

import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';

import { McqMrqAdapter } from '../common/translationAdapter';
import useDirty from '../common/useDirty';
import { OptionsErrors } from '../common/validations';

import Option, { OptionRef } from './Option';

interface OptionsManagerProps {
  for: OptionEntity[];
  onDirtyChange: (isDirty: boolean) => void;
  adapter: McqMrqAdapter;
  allowRandomization?: boolean;
  hideCorrect?: boolean;
  disabled?: boolean;
}

export interface OptionsManagerRef {
  getOptions: () => OptionEntity[];
  reset: () => void;
  setErrors: (errors: OptionsErrors) => void;
  resetErrors: () => void;
}

const OptionsManager = forwardRef<OptionsManagerRef, OptionsManagerProps>(
  (props, ref): JSX.Element => {
    const { disabled, for: originalOptions } = props;
    const [options, setOptions] = useState(originalOptions);

    const optionRefs = useRef<Record<OptionEntity['id'], OptionRef>>({});

    const { isDirty, mark, marker, reset } = useDirty<OptionEntity['id']>();
    const [error, setError] = useState<string>();

    const idToIndex = useMemo(
      () =>
        originalOptions.reduce<Record<OptionEntity['id'], number>>(
          (map, option, index) => {
            map[option.id] = index;
            return map;
          },
          {},
        ),
      [originalOptions],
    );

    const resetErrors = (): void => {
      setError(undefined);
      options.forEach((option) => optionRefs.current[option.id].resetError());
    };

    useImperativeHandle(ref, () => ({
      getOptions: () =>
        options.map((option) => optionRefs.current[option.id].getOption()),
      reset: (): void => {
        options.forEach((option) => optionRefs.current[option.id].reset());
        setOptions(originalOptions);
        reset();
        resetErrors();
      },
      resetErrors,
      setErrors: (errors: OptionsErrors): void => {
        setError(errors.error);

        Object.entries(errors.errors ?? {}).forEach(([index, optionError]) => {
          const id = options[index].id;
          optionRefs.current[id]?.setError(optionError);
        });
      },
    }));

    const isOrderDirty = (currentOptions: OptionEntity[]): boolean => {
      if (currentOptions.length !== originalOptions.length) return true;

      return currentOptions.some(
        (option, index) => idToIndex[option.id] !== index,
      );
    };

    useEffect(() => {
      props.onDirtyChange(isDirty || isOrderDirty(options));
    }, [isDirty, options]);

    const update = (updater: (draft: OptionEntity[]) => void): void =>
      setOptions(produce(updater));

    const reorder = (result: DropResult): void => {
      if (!result.destination) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;
      if (sourceIndex === destinationIndex) return;

      update((draft) => {
        const [moved] = draft.splice(sourceIndex, 1);
        draft.splice(destinationIndex, 0, moved);
      });
    };

    const addNewOption = (): void => {
      const count = options.length;
      const id = `new-option-${count}`;

      update((draft) => {
        draft.push({
          id,
          option: '',
          correct: !draft.length,
          explanation: '',
          ignoreRandomization: false,
          weight: count,
          draft: true,
        });
      });

      mark(id, true);
    };

    const deleteDraftHandler =
      (index: number, id: OptionEntity['id']) => () => {
        update((draft) => {
          draft.splice(index, 1);
        });

        mark(id, false);
      };

    return (
      <>
        {error && (
          <Typography color="error" variant="body2">
            {formatErrorMessage(error)}
          </Typography>
        )}

        {Boolean(options?.length) && (
          <DragDropContext onDragEnd={reorder}>
            <Droppable droppableId="options">
              {(droppable): JSX.Element => (
                <Paper
                  ref={droppable.innerRef}
                  variant="outlined"
                  {...droppable.droppableProps}
                >
                  {options.map((option, index) => (
                    <Option
                      key={option.id}
                      ref={(optionRef): void => {
                        if (optionRef)
                          optionRefs.current[option.id] = optionRef;
                      }}
                      adapter={props.adapter}
                      allowRandomization={props.allowRandomization}
                      disabled={disabled}
                      for={option}
                      hideCorrect={props.hideCorrect}
                      index={index}
                      onDeleteDraft={deleteDraftHandler(index, option.id)}
                      onDirtyChange={marker(option.id)}
                    />
                  ))}

                  {droppable.placeholder}
                </Paper>
              )}
            </Droppable>
          </DragDropContext>
        )}

        <Button
          disabled={disabled}
          onClick={addNewOption}
          size="small"
          startIcon={<Add />}
          variant="outlined"
        >
          {props.adapter.add}
        </Button>
      </>
    );
  },
);

OptionsManager.displayName = 'OptionsManager';

export default OptionsManager;
