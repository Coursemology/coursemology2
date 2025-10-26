import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import {
  Approval,
  Delete,
  Difference,
  ExpandLess,
  ExpandMore,
  Save,
} from '@mui/icons-material';
import { Card, IconButton, Typography } from '@mui/material';
import { JobStatus } from 'types/jobs';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import { pollJobRequest } from 'lib/helpers/jobHelpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import loadingToast, { LoadingToast } from 'lib/hooks/toast/loadingToast';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime, formatMiniDateTime } from 'lib/moment';
import formTranslations from 'lib/translations/form';

import { actions as questionRubricsActions } from '../../reducers/rubrics';
import { exportEvaluations } from '../operations/rowEvaluation';
import { createNewRubric, deleteRubric } from '../operations/rubric';
import { RubricHeaderFormData } from '../types';

import HeaderButton from './HeaderButton';
import PlaygroundCategoryManager from './PlaygroundCategoryManager';
import VersionSlider from './VersionSlider';

const EXPORT_JOB_POLL_INTERVAL_MS = 2000;

const RubricHeader = (props: {
  selectedRubricId: number;
  setSelectedRubricId: Dispatch<SetStateAction<number>>;
}): JSX.Element | null => {
  const { t } = useTranslation();

  const { selectedRubricId, setSelectedRubricId } = props;
  const [isRubricExpanded, setIsRubricExpanded] = useState(false);
  const [isConfirmingExport, setIsConfirmingExport] = useState(false);

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
      categories: (selectedRubric?.categories ?? []).map((category) => ({
        ...category,
        criterions: category.criterions.map((criterion) => ({
          ...criterion,
          draft: false,
          toBeDeleted: false,
        })),
        toBeDeleted: false,
      })),
      gradingPrompt: selectedRubric?.gradingPrompt ?? '',
    });
  }, [selectedRubricId]);

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

  const exportJobPollerRef = useRef<NodeJS.Timeout | null>(null);
  const exportJobToastRef = useRef<LoadingToast | null>(null);

  const handleExport = async (): Promise<void> => {
    const jobStatus = await exportEvaluations(selectedRubricId);
    dispatch(questionRubricsActions.updateRubricExportJob(jobStatus));
    exportJobToastRef.current = loadingToast('Applying rubric grading data...');
  };

  const handleExportJobPolling = async (): Promise<void> => {
    if (rubricState.exportJob?.status === JobStatus.submitted) {
      const jobStatus = await pollJobRequest(rubricState.exportJob.jobUrl);
      if (exportJobToastRef.current) {
        if (jobStatus.status === JobStatus.completed) {
          exportJobToastRef.current.success(
            'Grading rubric, prompt, and results successfully applied.',
          );
        } else if (jobStatus.status === JobStatus.errored) {
          exportJobToastRef.current.error('Failed to export grading results');
        }
      }
      dispatch(questionRubricsActions.updateRubricExportJob(jobStatus));
    }
  };

  const handleDelete = async (): Promise<void> => {
    await deleteRubric(selectedRubricId);
    const rubricIdToDelete = selectedRubricId;
    if (selectedRubricIndex > 0) {
      setSelectedRubricId(sortedRubrics[selectedRubricIndex - 1].id);
    } else {
      setSelectedRubricId(sortedRubrics[1].id);
    }
    dispatch(questionRubricsActions.deleteRubric(rubricIdToDelete));
  };

  useEffect(() => {
    exportJobPollerRef.current = setInterval(
      handleExportJobPolling,
      EXPORT_JOB_POLL_INTERVAL_MS,
    );

    // clean up poller on unmount
    return () => {
      if (exportJobPollerRef.current) {
        clearInterval(exportJobPollerRef.current);
      }
    };
  });

  if (!selectedRubric) return null;

  return (
    <Card className="sticky top-0 px-4 bg-white z-50" variant="outlined">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {sortedRubrics.length > 1 && (
          <div className="w-full flex justify-center pt-10">
            <VersionSlider
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
              track={false}
              value={selectedRubricIndex}
              valueLabelDisplay="on"
              valueLabelFormat={(rubricIndex) =>
                `${formatLongDateTime(sortedRubrics[rubricIndex].createdAt)}`
              }
            />
          </div>
        )}
        <div className="flex flex-row space-x-3 items-center">
          <IconButton onClick={() => setIsRubricExpanded(!isRubricExpanded)}>
            {isRubricExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>

          <div className="flex-1" />

          <HeaderButton
            color="info"
            disabled={!form.formState.isDirty}
            icon={<Save />}
            title={t(formTranslations.save)}
            type="submit"
          />

          <HeaderButton color="info" icon={<Difference />} title="Compare" />

          <HeaderButton
            color="info"
            disabled={rubricState.exportJob?.status === JobStatus.submitted}
            icon={<Approval />}
            onClick={() => setIsConfirmingExport(true)}
            title="Apply"
          />

          <HeaderButton
            color="error"
            disabled={Object.keys(rubricState.rubrics).length <= 1}
            icon={<Delete />}
            onClick={handleDelete}
            title={t(formTranslations.delete)}
          />
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
                <PlaygroundCategoryManager disabled={false} />
              </FormProvider>
            </div>
          </div>
        )}
        <Prompt
          contentClassName="space-y-5"
          onClickPrimary={() => {
            setIsConfirmingExport(false);
            handleExport();
          }}
          onClose={() => setIsConfirmingExport(false)}
          open={isConfirmingExport}
          primaryColor="info"
          primaryLabel="Apply"
          title="Confirm AI Grading Application"
        >
          {selectedRubricIndex < sortedRubrics.length - 1 && (
            <PromptText>
              You have selected to apply a rubric which is not the latest
              revision you saved on this page.
            </PromptText>
          )}

          <PromptText>
            Applying this rubric will assign grades to all student answers,
            including the ones not yet evaluated on this page.
          </PromptText>

          <PromptText>Are you sure you wish to proceed?</PromptText>
        </Prompt>
      </form>
    </Card>
  );
};

export default RubricHeader;
