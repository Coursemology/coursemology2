import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Approval,
  Clear,
  Delete,
  Edit,
  RestartAlt,
  Save,
  Star,
} from '@mui/icons-material';
import {
  Alert,
  Card,
  Chip,
  FormControlLabel,
  Radio,
  Typography,
} from '@mui/material';
import { JobStatus } from 'types/jobs';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import { pollJobRequest } from 'lib/helpers/jobHelpers';
import { getAssessmentURL } from 'lib/helpers/url-builders';
import { getAssessmentId, getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import loadingToast, { LoadingToast } from 'lib/hooks/toast/loadingToast';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import formTranslations from 'lib/translations/form';

import {
  actions as questionRubricsActions,
  RubricState,
} from '../../reducers/rubrics';
import ApplyEvaluationsPrompt from '../ApplyEvaluationsPrompt';
import { applyEvaluations } from '../operations/rowEvaluation';
import {
  deleteRubric,
  RubricAdvanceConfirmationError,
} from '../operations/rubric';
import translations from '../translations';
import { RubricPlaygroundTab, SliderRevision } from '../types';

import HeaderButton from './HeaderButton';
import VersionSlider from './VersionSlider';

const EXPORT_JOB_POLL_INTERVAL_MS = 2000;

interface RubricHeaderProps {
  activeTab: RubricPlaygroundTab;
  compareCount: number;
  // Saved rubrics in slider order, plus the unsaved draft appended at the end while editing.
  revisions: SliderRevision[];
  selectedRevisionIndex: number;
  // The selected saved rubric; undefined when the unsaved draft is selected.
  selectedRubric?: RubricState;
  onSelectRevision: (revisionId: number) => void;
  onStartEditing: () => void;
  onReturnToEditing: () => void;
  onRestartEditing: () => void;
  onDiscardChanges: () => void;
  onSaveDraft: () => void;
  onSetActive: (confirmRubricAdvance: boolean) => Promise<void>;
  setActiveTab: Dispatch<SetStateAction<RubricPlaygroundTab>>;
  setCompareCount: Dispatch<SetStateAction<number>>;
}

const RubricHeader: FC<RubricHeaderProps> = (props) => {
  const { t } = useTranslation();

  const {
    activeTab,
    compareCount,
    revisions,
    selectedRevisionIndex,
    selectedRubric,
    onSelectRevision,
    onStartEditing,
    onReturnToEditing,
    onRestartEditing,
    onDiscardChanges,
    onSaveDraft,
    onSetActive,
    setActiveTab,
    setCompareCount,
  } = props;
  const [isConfirmingExport, setIsConfirmingExport] = useState(false);
  // Confirmation gate for the two actions that throw away unsaved draft edits.
  const [confirmAction, setConfirmAction] = useState<'discard' | 'restart'>();
  // Confirmation gate for setting a structurally incompatible revision as active (may re-grade answers).
  const [confirmingSetActive, setConfirmingSetActive] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const rubricState = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );
  const activeRubric = Object.values(rubricState.rubrics).find(
    (rubric) => rubric.isActive,
  );

  // Forward the request unconditionally; the backend re-grades and rejects an incompatible change with graded
  // answers (409), which we surface as a confirmation before retrying with confirmRubricAdvance.
  const handleSetActive = async (): Promise<void> => {
    try {
      await onSetActive(false);
    } catch (error) {
      if (error instanceof RubricAdvanceConfirmationError) {
        setConfirmingSetActive(true);
        return;
      }
      throw error;
    }
  };

  const isEditing = activeTab === RubricPlaygroundTab.EDIT;
  // While editing, the unsaved draft is editable; any other revision is a read-only preview.
  const selectedIsUnsaved = !!revisions[selectedRevisionIndex]?.isUnsaved;

  const exportJobPollerRef = useRef<NodeJS.Timeout | null>(null);
  const exportJobToastRef = useRef<LoadingToast | null>(null);

  // Bulk apply (from the confirmation table): kick off the job and surface progress via a toast. Any error
  // (including the "unevaluated answers" guard) propagates to the caller so it can re-confirm.
  const handleApply = async (
    answerIds: number[],
    applyUnevaluated: boolean,
  ): Promise<void> => {
    if (!activeRubric || answerIds.length === 0) return;

    const jobStatus = await applyEvaluations(
      activeRubric.id,
      answerIds,
      applyUnevaluated,
    );
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
    if (!selectedRubric) return;

    const rubricIdToDelete = selectedRubric.id;
    // Delete on the backend first; only mutate the slider if it succeeds (e.g. the active rubric is rejected).
    try {
      await deleteRubric(rubricIdToDelete);
    } catch {
      toast.error(t(translations.deleteRubricFailure));
      return;
    }
    if (selectedRevisionIndex > 0) {
      onSelectRevision(revisions[selectedRevisionIndex - 1].id);
    } else {
      onSelectRevision(revisions[1].id);
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

  const unsavedRevisionIndex = revisions.findIndex(
    (revision) => revision.isUnsaved,
  );
  const activeRevisionIndex = revisions.findIndex(
    (revision) => revision.isActive,
  );

  // Top-of-slider chips: "Unsaved" on the in-progress draft, "Active" on the question's active rubric,
  // and "Latest" on the most recent saved revision (suppressed when it is also active). All jump there.
  const renderVersionChip = (
    revision: SliderRevision,
    revisionIndex: number,
  ): JSX.Element | string => {
    const jumpToRevision = (): void => onSelectRevision(revision.id);

    if (revisionIndex === unsavedRevisionIndex) {
      return (
        <Chip
          color="warning"
          label={t(translations.unsavedRubric)}
          onClick={jumpToRevision}
          size="small"
          variant="outlined"
        />
      );
    }
    if (revisionIndex === activeRevisionIndex) {
      return (
        <Chip
          color="info"
          icon={<Star />}
          label={t(translations.activeRubric)}
          onClick={jumpToRevision}
          size="small"
          variant="outlined"
        />
      );
    }
    return '';
  };

  return (
    <Card className="sticky top-0 px-4 bg-white z-50" variant="outlined">
      {revisions.length === 1 && (
        <div className="flex flex-row items-center gap-2 pt-3">
          <Typography variant="body2">
            {t(translations.savedRubric, {
              date: formatLongDateTime(revisions[0].createdAt),
            })}
          </Typography>
          {revisions[0].isActive && (
            <Chip
              color="info"
              icon={<Star fontSize="small" />}
              label={t(translations.activeRubric)}
              size="small"
              variant="outlined"
            />
          )}
        </div>
      )}
      {revisions.length > 1 && (
        <div className="w-full flex justify-center pt-10">
          <VersionSlider
            className="w-[90%] pb-10"
            marks={revisions.map((revision, revisionIndex) => ({
              label: renderVersionChip(revision, revisionIndex),
              value: revisionIndex,
            }))}
            max={revisions.length - 1}
            min={0}
            onChangeCommitted={(_, newIndexOrIndices) => {
              if (typeof newIndexOrIndices === 'number') {
                onSelectRevision(revisions[newIndexOrIndices].id);
              } else {
                const [compareFromIndex, newIndex] = newIndexOrIndices;
                onSelectRevision(revisions[newIndex].id);
                setCompareCount(newIndex - compareFromIndex + 1);
              }
            }}
            step={null}
            track={activeTab === RubricPlaygroundTab.COMPARE ? 'normal' : false}
            value={
              activeTab === RubricPlaygroundTab.COMPARE
                ? [
                    selectedRevisionIndex - compareCount + 1,
                    selectedRevisionIndex,
                  ]
                : selectedRevisionIndex
            }
            valueLabelDisplay="on"
            valueLabelFormat={(revisionIndex) =>
              revisionIndex === selectedRevisionIndex
                ? `${formatLongDateTime(revisions[revisionIndex].createdAt)}`
                : ''
            }
          />
        </div>
      )}
      {revisions.length > 1 && !isEditing && (
        <Alert
          className="mb-3 px-3 py-0"
          icon={false}
          severity="info"
          variant="outlined"
        >
          {selectedRubric?.isActive && t(translations.activeRubricInfo)}
          {!selectedRubric?.isActive && t(translations.inactiveRubricInfo)}
        </Alert>
      )}
      {!isEditing && selectedRubric && (
        <Card className="my-3" variant="outlined">
          <UserHTMLText
            className="p-3 line-clamp-4"
            html={selectedRubric.summary}
          />
        </Card>
      )}
      <div className="flex flex-row space-x-3 items-center pb-3">
        {!isEditing && (
          <HeaderButton
            color="info"
            icon={<Edit />}
            onClick={onStartEditing}
            title={t(translations.viewEditRubric)}
            variant="outlined"
          />
        )}

        {isEditing && selectedIsUnsaved && (
          <HeaderButton
            color="info"
            icon={<Save />}
            onClick={onSaveDraft}
            title={t(formTranslations.save)}
          />
        )}

        {isEditing && !selectedIsUnsaved && (
          <HeaderButton
            color="warning"
            icon={<Edit />}
            onClick={onReturnToEditing}
            title={t(translations.returnToEditing)}
            variant="outlined"
          />
        )}

        {isEditing && !selectedIsUnsaved && (
          <HeaderButton
            color="warning"
            icon={<RestartAlt />}
            onClick={() => setConfirmAction('restart')}
            title={t(translations.restartEditing)}
            variant="outlined"
          />
        )}

        {isEditing && (
          <HeaderButton
            color="error"
            icon={<Clear />}
            onClick={() => setConfirmAction('discard')}
            title={t(translations.discardChanges)}
          />
        )}

        <div className="flex-1" />

        {!isEditing && (
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

        {!isEditing && (
          <FormControlLabel
            className="select-none pr-4"
            control={
              <Radio
                checked={activeTab === RubricPlaygroundTab.COMPARE}
                color="info"
                disabled={revisions.length <= 1}
                onChange={() => setActiveTab(RubricPlaygroundTab.COMPARE)}
              />
            }
            disabled={revisions.length <= 1}
            label={t(translations.compare)}
            slotProps={{ typography: { variant: 'subtitle2' } }}
          />
        )}

        {!isEditing && (
          <HeaderButton
            color="info"
            disabled={!selectedRubric || selectedRubric.isActive}
            icon={<Star />}
            onClick={handleSetActive}
            title={t(translations.setAsActive)}
            variant="outlined"
          />
        )}

        {!isEditing && (
          <HeaderButton
            color="info"
            disabled={
              !selectedRubric?.isActive ||
              rubricState.exportJob?.status === JobStatus.submitted
            }
            icon={<Approval />}
            onClick={() => {
              if (activeTab !== RubricPlaygroundTab.EVALUATE) {
                setActiveTab(RubricPlaygroundTab.EVALUATE);
              }
              setIsConfirmingExport(true);
            }}
            title={t(translations.apply)}
            tooltip={
              selectedRubric && !selectedRubric.isActive
                ? t(translations.applyOnlyActiveRubric)
                : undefined
            }
          />
        )}

        {!isEditing && (
          <HeaderButton
            color="error"
            disabled={
              selectedRubric?.isActive ||
              Object.keys(rubricState.rubrics).length <= 1
            }
            icon={<Delete />}
            onClick={handleDelete}
            title={t(formTranslations.delete)}
          />
        )}
      </div>
      {activeRubric && (
        <ApplyEvaluationsPrompt
          activeRubric={activeRubric}
          answers={rubricState.answers}
          onApply={handleApply}
          onClose={() => setIsConfirmingExport(false)}
          open={isConfirmingExport}
        />
      )}
      <Prompt
        contentClassName="space-y-5"
        onClickPrimary={() => {
          const action = confirmAction;
          setConfirmAction(undefined);
          if (action === 'discard') onDiscardChanges();
          else if (action === 'restart') onRestartEditing();
        }}
        onClose={() => setConfirmAction(undefined)}
        open={confirmAction !== undefined}
        primaryColor="error"
        primaryLabel={
          confirmAction === 'restart'
            ? t(translations.restart)
            : t(translations.discardChanges)
        }
        title={
          confirmAction === 'restart'
            ? t(translations.confirmRestartEditingTitle)
            : t(translations.confirmDiscardChangesTitle)
        }
      >
        <PromptText>
          {confirmAction === 'restart'
            ? t(translations.confirmRestartEditingText)
            : t(translations.confirmDiscardChangesText)}
        </PromptText>

        <PromptText>{t(translations.confirmProceed)}</PromptText>
      </Prompt>

      <Prompt
        onClickPrimary={() => {
          setConfirmingSetActive(false);
          onSetActive(true);
        }}
        onClose={() => setConfirmingSetActive(false)}
        open={confirmingSetActive}
        primaryColor="warning"
        primaryLabel={t(translations.setAsActive)}
        title={t(translations.confirmSetActiveTitle)}
      >
        <PromptText>{t(translations.confirmSetActiveText)}</PromptText>
      </Prompt>
    </Card>
  );
};

export default RubricHeader;
