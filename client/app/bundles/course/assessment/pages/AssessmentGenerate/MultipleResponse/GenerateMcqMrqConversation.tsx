import { FC, useEffect, useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import Clear from '@mui/icons-material/Clear';
import DoneAll from '@mui/icons-material/DoneAll';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextareaAutosize,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';

import Accordion from 'lib/components/core/layouts/Accordion';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import { McqMrqGenerateFormData, SnapshotState } from '../types';

const translations = defineMessages({
  numberOfQuestionsField: {
    id: 'course.assessment.generation.mrq.numberOfQuestionsField',
    defaultMessage: 'Number of Questions',
  },
  promptPlaceholder: {
    id: 'course.assessment.generation.promptPlaceholder',
    defaultMessage: 'Type something here...',
  },
  generateQuestion: {
    id: 'course.assessment.generation.generateQuestion',
    defaultMessage: 'Generate',
  },
  showInactive: {
    id: 'course.assessment.generation.showInactive',
    defaultMessage: 'Show inactive items',
  },
  numberOfQuestionsRange: {
    id: 'course.assessment.generation.mrq.numberOfQuestionsRange',
    defaultMessage: 'Please enter a number from {min} to {max}',
  },
  enhanceMode: {
    id: 'course.assessment.generation.enhanceMode',
    defaultMessage: 'Enhance',
  },
  createMode: {
    id: 'course.assessment.generation.createMode',
    defaultMessage: 'Create New',
  },
  enhanceModeTooltip: {
    id: 'course.assessment.generation.enhanceModeTooltip',
    defaultMessage: 'Build upon your current question',
  },
  createModeTooltip: {
    id: 'course.assessment.generation.createModeTooltip',
    defaultMessage: 'Generate fresh questions from scratch',
  },
});

const MAX_PROMPT_LENGTH = 10_000;
const NUM_OF_QN_MIN = 1;
const NUM_OF_QN_MAX = 10;

const ConversationSnapshot: FC<{
  snapshot: SnapshotState;
  className: string;
  onClickSnapshot: (snapshot: SnapshotState) => void;
}> = (props) => {
  const { snapshot, className, onClickSnapshot } = props;

  return (
    <div
      className={`${className} cursor-pointer`}
      onClick={() => onClickSnapshot(snapshot)}
    >
      <Typography className="line-clamp-4">
        {snapshot.state === 'generating' && (
          <LoadingIndicator bare className="mr-2 text-gray-600" size={15} />
        )}
        {snapshot.state === 'success' && (
          <DoneAll className="mr-1 text-gray-600" fontSize="small" />
        )}
        {snapshot?.generateFormData?.customPrompt}
      </Typography>
    </div>
  );
};

interface Props {
  onGenerate: (data: McqMrqGenerateFormData) => Promise<void>;
  onSaveActiveData: () => void;
  questionFormDataEqual: () => boolean;
  generateForm: UseFormReturn<McqMrqGenerateFormData>;
  activeSnapshotId: string;
  snapshots: { [id: string]: SnapshotState };
  latestSnapshotId: string;
  onClickSnapshot: (snapshot: SnapshotState) => void;
}

const GenerateMcqMrqConversation: FC<Props> = (props) => {
  const { t } = useTranslation();
  const {
    onGenerate,
    onSaveActiveData,
    questionFormDataEqual,
    generateForm,
    activeSnapshotId,
    snapshots,
    latestSnapshotId,
    onClickSnapshot,
  } = props;

  // Store the mode before generation starts to preserve it during generation
  const [modeBeforeGeneration, setModeBeforeGeneration] = useState(
    generateForm.getValues('generationMode'),
  );

  const customPrompt = generateForm.watch('customPrompt');
  const isEnhanceMode = generateForm.watch('generationMode') === 'enhance';
  const isGenerating = Object.values(snapshots || {}).some(
    (snapshot) => snapshot.state === 'generating',
  );

  // Update the stored mode when not generating
  useEffect(() => {
    if (!isGenerating) {
      setModeBeforeGeneration(generateForm.getValues('generationMode'));
    }
  }, [generateForm.watch('generationMode'), isGenerating]);

  // Set default generation mode based on snapshot state
  useEffect(() => {
    const currentSnapshot = snapshots?.[activeSnapshotId];
    const isSentinel = currentSnapshot?.state === 'sentinel';
    const defaultMode = isSentinel ? 'create' : 'enhance';
    const currentMode = generateForm.getValues('generationMode');

    // Only update if the current mode doesn't match the expected default
    if (currentMode !== defaultMode) {
      generateForm.setValue('generationMode', defaultMode);
    }
  }, [activeSnapshotId, snapshots, generateForm]);

  // Set numberOfQuestions to 1 when enhance mode is selected
  useEffect(() => {
    const currentMode = generateForm.watch('generationMode');
    if (currentMode === 'enhance') {
      generateForm.setValue('numberOfQuestions', 1);
    }
  }, [generateForm.watch('generationMode'), generateForm]);

  let traversalId: string | undefined = latestSnapshotId;
  const mainlineSnapshots: SnapshotState[] = [];
  while (traversalId !== undefined && snapshots?.[traversalId]) {
    mainlineSnapshots.push(snapshots[traversalId]);
    traversalId = snapshots[traversalId].parentId;
  }
  const mainlineSnapshotsToRender = mainlineSnapshots
    .filter((snapshot) => snapshot.state !== 'sentinel')
    .reverse();
  mainlineSnapshotsToRender.push(
    ...Object.values(snapshots || {}).filter(
      (snapshot) => snapshot.state === 'generating',
    ),
  );

  const inactiveSnapshotsToRender = Object.values(snapshots || {}).filter(
    (snapshot) =>
      snapshot.state !== 'sentinel' &&
      !mainlineSnapshotsToRender.some(
        (snapshot2) => snapshot.id === snapshot2.id,
      ),
  );

  const handleGenerate = async (): Promise<void> => {
    if (!questionFormDataEqual()) {
      onSaveActiveData();
    }
    await onGenerate(generateForm.getValues());
  };

  return (
    <Paper
      className="p-3 mt-6 flex flex-col flex-nowrap"
      sx={{ height: { lg: 'calc(100% - 100px)' } }}
      variant="outlined"
    >
      <Box className="my-1 flex-1 full-width full-height overflow-y-scroll box-border">
        {mainlineSnapshotsToRender.map((snapshot) => {
          const active =
            snapshot.state === 'success' && snapshot.id === activeSnapshotId;
          return (
            <ConversationSnapshot
              key={snapshot.id}
              className={`py-1 px-2 my-2 w-full shadow-none border border-solid border-gray-400 rounded-lg${
                active ? ' bg-yellow-100' : ''
              }`}
              onClickSnapshot={onClickSnapshot}
              snapshot={snapshot}
            />
          );
        })}
        {inactiveSnapshotsToRender.length > 0 && (
          <Accordion
            defaultExpanded={false}
            sx={{
              '& .MuiAccordionSummary-root': {
                paddingX: '1rem !important',
                paddingY: '0.5rem !important',
              },
            }}
            title={t(translations.showInactive)}
          >
            {inactiveSnapshotsToRender.map((snapshot) => {
              const active =
                snapshot.state === 'success' &&
                snapshot.id === activeSnapshotId;
              return (
                <ConversationSnapshot
                  key={snapshot.id}
                  className={`opacity-50 py-1 px-2 my-2 w-full shadow-none border border-solid border-gray-300 rounded-lg${
                    active ? ' bg-yellow-100' : ''
                  }`}
                  onClickSnapshot={onClickSnapshot}
                  snapshot={snapshot}
                />
              );
            })}
          </Accordion>
        )}
      </Box>

      <div className="flex flex-col my-4">
        <Controller
          control={generateForm.control}
          name="generationMode"
          render={({ field }): JSX.Element => (
            <ToggleButtonGroup
              color="primary"
              disabled={isGenerating}
              exclusive
              fullWidth
              onChange={(_, newValue) => {
                // Prevent onChange when disabled to preserve the selected value
                if (isGenerating) {
                  return;
                }
                if (newValue !== null) {
                  field.onChange(newValue);
                }
              }}
              size="small"
              value={isGenerating ? modeBeforeGeneration : field.value}
            >
              <Tooltip
                placement="top"
                title={t(translations.createModeTooltip)}
              >
                <ToggleButton className="flex-1" value="create">
                  {t(translations.createMode)}
                </ToggleButton>
              </Tooltip>
              <Tooltip
                placement="top"
                title={t(translations.enhanceModeTooltip)}
              >
                <ToggleButton className="flex-1" value="enhance">
                  {t(translations.enhanceMode)}
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          )}
        />
      </div>

      <div className="flex flex-col">
        <Controller
          control={generateForm.control}
          name="customPrompt"
          render={({ field: { onChange, value } }): JSX.Element => (
            <TextareaAutosize
              className="full-width font-sans resize-none p-2 text-2xl"
              disabled={isGenerating}
              maxRows={4}
              minRows={4}
              onChange={onChange}
              placeholder={t(translations.promptPlaceholder)}
              value={value}
            />
          )}
        />
        <Typography
          className="mr-2 text-right"
          color={
            customPrompt.length > MAX_PROMPT_LENGTH ? 'error' : 'textSecondary'
          }
          variant="caption"
        >
          {customPrompt.length} / {MAX_PROMPT_LENGTH}
        </Typography>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-nowrap gap-4 items-center">
          {((): JSX.Element => {
            return (
              <div
                className="transition-opacity duration-200 flex-grow"
                style={{
                  opacity: isEnhanceMode ? 0 : 1,
                  pointerEvents: isEnhanceMode ? 'none' : 'auto',
                }}
              >
                <Controller
                  control={generateForm.control}
                  name="numberOfQuestions"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      disabled={isGenerating}
                      disableMargins
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      InputProps={{
                        inputProps: {
                          min: NUM_OF_QN_MIN,
                          max: NUM_OF_QN_MAX,
                          step: 1,
                          onKeyDown: (e) => {
                            if (['-', '.', 'e', 'E'].includes(e.key)) {
                              e.preventDefault();
                            }
                          },
                        },
                        endAdornment: !isEnhanceMode &&
                          !isGenerating &&
                          field.value !== undefined &&
                          field.value !== null && (
                            <InputAdornment position="end">
                              <IconButton
                                edge="end"
                                onClick={() => field.onChange('')}
                                size="small"
                                tabIndex={-1}
                              >
                                <Clear />
                              </IconButton>
                            </InputAdornment>
                          ),
                      }}
                      label={t(translations.numberOfQuestionsField)}
                      type="number"
                      variant="filled"
                    />
                  )}
                />
              </div>
            );
          })()}

          <Button
            className="w-48 max-h-14"
            disabled={isGenerating || !generateForm.formState.isValid}
            onClick={handleGenerate}
            startIcon={isGenerating && <LoadingIndicator bare size={20} />}
            variant="contained"
          >
            {t(translations.generateQuestion)}
          </Button>
        </div>

        {((): JSX.Element | null => {
          const value = generateForm.watch('numberOfQuestions');
          const isOutOfRange =
            value && (value < NUM_OF_QN_MIN || value > NUM_OF_QN_MAX);
          return (
            <div
              className="transition-opacity duration-300 ml-4 overflow-hidden"
              style={{
                opacity: isEnhanceMode ? 0 : 1,
                pointerEvents: isEnhanceMode ? 'none' : 'auto',
              }}
            >
              <Typography
                color={isOutOfRange ? 'error' : 'textSecondary'}
                variant="caption"
              >
                {t(translations.numberOfQuestionsRange, {
                  min: NUM_OF_QN_MIN,
                  max: NUM_OF_QN_MAX,
                })}
              </Typography>
            </div>
          );
        })()}
      </div>
    </Paper>
  );
};

export default GenerateMcqMrqConversation;
