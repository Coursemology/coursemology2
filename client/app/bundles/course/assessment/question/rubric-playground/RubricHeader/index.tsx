import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Approval, Clear, Delete, Edit, Save } from '@mui/icons-material';
import { Card, FormControlLabel, Radio, Typography } from '@mui/material';
import { JobStatus } from 'types/jobs';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import { pollJobRequest } from 'lib/helpers/jobHelpers';
import { getAssessmentURL } from 'lib/helpers/url-builders';
import { getAssessmentId, getCourseId } from 'lib/helpers/url-helpers';
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
import translations from '../translations';
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
  const navigate = useNavigate();
  const rubricState = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );

  const isSliderDisabled =
    activeTab !== RubricPlaygroundTab.EVALUATE &&
    activeTab !== RubricPlaygroundTab.COMPARE;

  const exportJobPollerRef = useRef<NodeJS.Timeout | null>(null);
  const exportJobToastRef = useRef<LoadingToast | null>(null);

  const handleExport = async (): Promise<void> => {
    const jobStatus = await exportEvaluations(selectedRubric.id);
    dispatch(questionRubricsActions.updateRubricExportJob(jobStatus));
    exportJobToastRef.current = loadingToast(
      t(translations.applyingRubricGradingData),
    );
  };

  const handleExportJobPolling = async (): Promise<void> => {
    if (rubricState.exportJob?.status === JobStatus.submitted) {
      const jobStatus = await pollJobRequest(rubricState.exportJob.jobUrl);
      if (exportJobToastRef.current) {
        if (jobStatus.status === JobStatus.completed) {
          exportJobToastRef.current.success(t(translations.applySuccess));
          setTimeout(() => {
            navigate(getAssessmentURL(getCourseId(), getAssessmentId()));
          }, 100);
        } else if (jobStatus.status === JobStatus.errored) {
          exportJobToastRef.current.error(t(translations.applyFailure));
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
          {t(translations.savedRubric, {
            date: formatLongDateTime(selectedRubric.createdAt),
          })}
        </Typography>
      )}
      {sortedRubrics.length > 1 && (
        <div className="w-full flex justify-center pt-10">
          <VersionSlider
            className={`w-[90%] pb-10${isSliderDisabled ? ' opacity-80' : ''}`}
            disabled={isSliderDisabled}
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
            title={t(translations.viewEditRubric)}
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
          <FormControlLabel
            className="select-none"
            control={
              <Radio
                checked={activeTab === RubricPlaygroundTab.EVALUATE}
                color="info"
                onChange={() => setActiveTab(RubricPlaygroundTab.EVALUATE)}
              />
            }
            label={t(translations.evaluate)}
            slotProps={{ typography: { variant: 'subtitle2' } }}
          />
        )}

        {activeTab !== RubricPlaygroundTab.EDIT && (
          <FormControlLabel
            className="select-none pr-4"
            control={
              <Radio
                checked={activeTab === RubricPlaygroundTab.COMPARE}
                color="info"
                disabled={sortedRubrics.length <= 1}
                onChange={() => setActiveTab(RubricPlaygroundTab.COMPARE)}
              />
            }
            disabled={sortedRubrics.length <= 1}
            label={t(translations.compare)}
            slotProps={{ typography: { variant: 'subtitle2' } }}
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
            title={t(translations.apply)}
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
        primaryLabel={t(translations.apply)}
        title={t(translations.confirmAIGradingApplication)}
      >
        {selectedRubricIndex < sortedRubrics.length - 1 && (
          <PromptText>{t(translations.notLatestRevisionWarning)}</PromptText>
        )}

        <PromptText>{t(translations.applyWillGradeAllAnswers)}</PromptText>

        <PromptText>{t(translations.confirmProceed)}</PromptText>
      </Prompt>
    </Card>
  );
};

export default RubricHeader;
