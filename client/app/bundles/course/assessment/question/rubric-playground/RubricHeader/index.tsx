import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Approval,
  Clear,
  Delete,
  Difference,
  Edit,
  PlaylistPlay,
  Save,
} from '@mui/icons-material';
import { Card, Typography } from '@mui/material';
import { JobStatus } from 'types/jobs';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import { pollJobRequest } from 'lib/helpers/jobHelpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import loadingToast, { LoadingToast } from 'lib/hooks/toast/loadingToast';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime, formatMiniDateTime } from 'lib/moment';
import formTranslations from 'lib/translations/form';

import {
  actions as questionRubricsActions,
  RubricState,
} from '../../reducers/rubrics';
import { exportEvaluations } from '../operations/rowEvaluation';
import { deleteRubric } from '../operations/rubric';
import { RubricEditFormData, RubricPlaygroundTab } from '../types';

import HeaderButton from './HeaderButton';
import VersionSlider from './VersionSlider';

const EXPORT_JOB_POLL_INTERVAL_MS = 2000;

interface RubricHeaderProps {
  activeTab: RubricPlaygroundTab;
  compareCount: number;
  editForm: UseFormReturn<RubricEditFormData>;
  selectedRubric: RubricState;
  selectedRubricIndex: number;
  setSelectedRubricId: Dispatch<SetStateAction<number>>;
  setActiveTab: Dispatch<SetStateAction<RubricPlaygroundTab>>;
  setCompareCount: Dispatch<SetStateAction<number>>;
  sortedRubrics: RubricState[];
}

const RubricHeader: FC<RubricHeaderProps> = (props) => {
  const { t } = useTranslation();

  const {
    activeTab,
    compareCount,
    editForm,
    selectedRubric,
    selectedRubricIndex,
    setActiveTab,
    setCompareCount,
    setSelectedRubricId,
    sortedRubrics,
  } = props;
  const [isConfirmingExport, setIsConfirmingExport] = useState(false);

  const dispatch = useAppDispatch();
  const rubricState = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );

  const exportJobPollerRef = useRef<NodeJS.Timeout | null>(null);
  const exportJobToastRef = useRef<LoadingToast | null>(null);

  const handleExport = async (): Promise<void> => {
    const jobStatus = await exportEvaluations(selectedRubric.id);
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
    await deleteRubric(selectedRubric.id);
    const rubricIdToDelete = selectedRubric.id;
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

  return (
    <Card className="sticky top-0 px-4 bg-white z-50" variant="outlined">
      {sortedRubrics.length === 1 && (
        <Typography className="pt-3" variant="body2">
          Saved Rubric, {formatLongDateTime(selectedRubric.createdAt)}
        </Typography>
      )}
      {sortedRubrics.length > 1 && (
        <div className="w-full flex justify-center pt-10">
          <VersionSlider
            className="w-[90%] pb-10"
            disabled={activeTab === RubricPlaygroundTab.EDIT}
            marks={sortedRubrics.map((rubric, rubricIndex) => ({
              label:
                rubricIndex === 0 || rubricIndex === sortedRubrics.length - 1
                  ? formatMiniDateTime(rubric.createdAt)
                  : '',
              value: rubricIndex,
            }))}
            max={sortedRubrics.length - 1}
            min={0}
            onChangeCommitted={(_, newIndexOrIndices) => {
              if (typeof newIndexOrIndices === 'number') {
                setSelectedRubricId(sortedRubrics[newIndexOrIndices].id);
              } else {
                const [compareFromIndex, newIndex] = newIndexOrIndices;
                setSelectedRubricId(sortedRubrics[newIndex].id);
                setCompareCount(newIndex - compareFromIndex + 1);
              }
            }}
            step={null}
            track={activeTab === RubricPlaygroundTab.COMPARE ? 'normal' : false}
            value={
              activeTab === RubricPlaygroundTab.COMPARE
                ? [selectedRubricIndex - compareCount + 1, selectedRubricIndex]
                : selectedRubricIndex
            }
            valueLabelDisplay="on"
            valueLabelFormat={(rubricIndex) =>
              rubricIndex === selectedRubricIndex
                ? `${formatLongDateTime(sortedRubrics[rubricIndex].createdAt)}`
                : ''
            }
          />
        </div>
      )}
      <div className="flex flex-row space-x-3 items-center pb-3">
        {activeTab !== RubricPlaygroundTab.EDIT && (
          <HeaderButton
            color="info"
            icon={<Edit />}
            onClick={() => setActiveTab(RubricPlaygroundTab.EDIT)}
            title="View / Edit Rubric"
            variant="outlined"
          />
        )}

        {activeTab === RubricPlaygroundTab.EDIT && (
          <HeaderButton
            color="info"
            disabled={!editForm.formState.isDirty}
            form="rubric-playground-edit-form"
            icon={<Save />}
            title={t(formTranslations.save)}
            type="submit"
          />
        )}

        {activeTab === RubricPlaygroundTab.EDIT && (
          <HeaderButton
            color="error"
            icon={<Clear />}
            onClick={() => setActiveTab(RubricPlaygroundTab.EVALUATE)}
            title={t(formTranslations.cancel)}
          />
        )}

        <div className="flex-1" />

        {activeTab !== RubricPlaygroundTab.EDIT && (
          <HeaderButton
            color="info"
            icon={<PlaylistPlay />}
            onClick={() => setActiveTab(RubricPlaygroundTab.EVALUATE)}
            title="Evaluate"
            variant={
              activeTab === RubricPlaygroundTab.EVALUATE
                ? 'contained'
                : 'outlined'
            }
          />
        )}

        {activeTab !== RubricPlaygroundTab.EDIT && sortedRubrics.length > 1 && (
          <HeaderButton
            color="info"
            icon={<Difference />}
            onClick={() => setActiveTab(RubricPlaygroundTab.COMPARE)}
            title="Compare"
            variant={
              activeTab === RubricPlaygroundTab.COMPARE
                ? 'contained'
                : 'outlined'
            }
          />
        )}

        {activeTab !== RubricPlaygroundTab.EDIT && (
          <HeaderButton
            color="info"
            disabled={rubricState.exportJob?.status === JobStatus.submitted}
            icon={<Approval />}
            onClick={() => {
              if (activeTab !== RubricPlaygroundTab.EVALUATE) {
                setActiveTab(RubricPlaygroundTab.EVALUATE);
              }
              setIsConfirmingExport(true);
            }}
            title="Apply"
          />
        )}

        {activeTab !== RubricPlaygroundTab.EDIT && (
          <HeaderButton
            color="error"
            disabled={Object.keys(rubricState.rubrics).length <= 1}
            icon={<Delete />}
            onClick={handleDelete}
            title={t(formTranslations.delete)}
          />
        )}
      </div>
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
            You have selected to apply a rubric which is not the latest revision
            saved on this page.
          </PromptText>
        )}

        <PromptText>
          Applying this rubric will assign grades to all student answers,
          including the ones not yet evaluated on this page.
        </PromptText>

        <PromptText>Are you sure you wish to proceed?</PromptText>
      </Prompt>
    </Card>
  );
};

export default RubricHeader;
