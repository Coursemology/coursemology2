import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { Delete, ExpandLess, ExpandMore, Save } from '@mui/icons-material';
import { Card, Chip, IconButton, Slider, Typography } from '@mui/material';

import {
  createNewRubric,
  deleteRubric,
} from 'course/assessment/operations/questions';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import { formatLongDateTime, formatMiniDateTime } from 'lib/moment';

import { actions as questionRubricsActions } from '../reducers/rubrics';

import PlaygroundCategoryManager from './PlaygroundCategoryManager';
import { RubricHeaderFormData } from './types';

const RubricHeader = (props: {
  selectedRubricId: number;
  setSelectedRubricId: Dispatch<SetStateAction<number>>;
}): JSX.Element | null => {
  const { selectedRubricId, setSelectedRubricId } = props;
  const [isRubricExpanded, setIsRubricExpanded] = useState(false);

  const dispatch = useAppDispatch();
  const rubricState = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );
  const sortedRubrics = Object.values(rubricState.rubrics).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const selectedRubric = rubricState.rubrics[selectedRubricId];
  const selectedRubricIndex = Object.values(rubricState.rubrics).findIndex(
    (rubric) => rubric.id === selectedRubricId,
  );

  const form = useForm<RubricHeaderFormData>({
    defaultValues: {
      categories: selectedRubric?.categories ?? [],
      gradingPrompt: selectedRubric?.gradingPrompt ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      categories: selectedRubric?.categories ?? [],
      gradingPrompt: selectedRubric?.gradingPrompt ?? '',
    });
  }, [selectedRubricId]);

  if (!selectedRubric) return null;

  const onSubmit: SubmitHandler<RubricHeaderFormData> = async (formData) => {
    const rubric = await createNewRubric(formData);
    await dispatch(
      questionRubricsActions.createNewRubric({
        rubric,
        selectedRubricId,
      }),
    );
    setSelectedRubricId(rubric.id);
  };

  return (
    <Card className="sticky top-0 px-4 bg-white z-50" variant="outlined">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {sortedRubrics.length > 1 &&
          <div className="w-full flex justify-center">
            <Slider
              className="w-[90%] pb-10"
              marks={sortedRubrics.map((rubric, rubricIndex) => ({
                label:
                  rubricIndex === 0 || rubricIndex === sortedRubrics.length - 1
                    ? formatMiniDateTime(rubric.createdAt)
                    : '',
                value: rubricIndex,
              }))}
              max={sortedRubrics.length - 1}
              min={0}
              onChangeCommitted={(_, newIndex) => {
                setSelectedRubricId(sortedRubrics[newIndex as number].id);
              }}
              step={null}
              value={selectedRubricIndex}
            />
          </div>
        }
        <div className="flex flex-row space-x-3 items-center">
          <Typography className="flex-1" variant="body1">
            Saved Rubric, {formatLongDateTime(selectedRubric.createdAt)}
            {form.formState.isDirty ? ' (modified)' : ''}
          </Typography>

          <IconButton onClick={() => setIsRubricExpanded(!isRubricExpanded)}>
            {isRubricExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>

          <IconButton
            color="info"
            disabled={!form.formState.isDirty}
            type="submit"
          >
            <Save />
          </IconButton>

          <Chip
            className="whitespace-nowrap"
            color="primary"
            label="Export"
            onClick={() => {}}
            variant="outlined"
          />

          <IconButton
            color="error"
            disabled={Object.keys(rubricState.rubrics).length <= 1}
            onClick={() => {
              deleteRubric(selectedRubricId).then(() => {
                const rubricIdToDelete = selectedRubricId;
                if (selectedRubricIndex > 0) {
                  setSelectedRubricId(
                    sortedRubrics[selectedRubricIndex - 1].id,
                  );
                } else {
                  setSelectedRubricId(sortedRubrics[1].id);
                }
                dispatch(questionRubricsActions.deleteRubric(rubricIdToDelete));
              });
            }}
          >
            <Delete />
          </IconButton>
        </div>
        {isRubricExpanded && (
          <div className="flex flex-row space-x-4">
            <div className="w-1/2">
              <Controller
                control={form.control}
                name="gradingPrompt"
                render={({ field, fieldState }): JSX.Element => (
                  <FormRichTextField
                    disabled={false}
                    field={field}
                    fieldState={fieldState}
                    fullWidth
                  />
                )}
              />
            </div>

            <div className="w-1/2">
              <FormProvider {...form}>
                <PlaygroundCategoryManager
                  disabled={false}
                  for={selectedRubric.categories ?? []}
                />
              </FormProvider>
            </div>
          </div>
        )}
      </form>
    </Card>
  );
};

export default RubricHeader;
