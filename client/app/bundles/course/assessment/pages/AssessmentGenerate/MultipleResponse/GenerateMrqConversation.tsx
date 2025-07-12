import { FC } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import DoneAll from '@mui/icons-material/DoneAll';
import {
  Box,
  Button,
  Paper,
  TextareaAutosize,
  Typography,
} from '@mui/material';

import Accordion from 'lib/components/core/layouts/Accordion';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import FormSelectField from 'lib/components/form/fields/SelectField';
import useTranslation from 'lib/hooks/useTranslation';

import { MrqGenerateFormData, SnapshotState } from '../types';

const translations = defineMessages({
  topicField: {
    id: 'course.assessment.generation.mrq.topicField',
    defaultMessage: 'Topic',
  },
  numberOfQuestionsField: {
    id: 'course.assessment.generation.mrq.numberOfQuestionsField',
    defaultMessage: 'Number of Questions',
  },
  difficultyField: {
    id: 'course.assessment.generation.mrq.difficultyField',
    defaultMessage: 'Difficulty',
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
});

const MAX_PROMPT_LENGTH = 500;

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
  onGenerate: (data: MrqGenerateFormData) => Promise<void>;
  onSaveActiveData: () => void;
  questionFormDataEqual: () => boolean;
  generateForm: UseFormReturn<MrqGenerateFormData>;
  activeSnapshotId: string;
  snapshots: { [id: string]: SnapshotState };
  latestSnapshotId: string;
  onClickSnapshot: (snapshot: SnapshotState) => void;
}

const GenerateMrqConversation: FC<Props> = (props) => {
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

  const customPrompt = generateForm.watch('customPrompt');

  const isGenerating = Object.values(snapshots || {}).some(
    (snapshot) => snapshot.state === 'generating',
  );

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

      <div className="flex flex-col gap-3">
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
        <Typography className="mb-1 mt-0.5 mr-2 text-right" variant="caption">
          {customPrompt.length} / {MAX_PROMPT_LENGTH}
        </Typography>
      </div>

      <div className="flex flex-nowrap">
        <Controller
          control={generateForm.control}
          name="numberOfQuestions"
          render={({ field, fieldState }): JSX.Element => (
            <FormSelectField
              className="mt-3 mx-0"
              disabled={isGenerating}
              field={field}
              fieldState={fieldState}
              label={t(translations.numberOfQuestionsField)}
              options={Array.from({ length: 10 }, (_, i) => ({
                value: i + 1,
                label: (i + 1).toString(),
              }))}
              required
              variant="outlined"
            />
          )}
        />

        <Button
          className="w-48 max-h-14 mt-8"
          disabled={isGenerating || !generateForm.formState.isValid}
          onClick={handleGenerate}
          startIcon={isGenerating && <LoadingIndicator bare size={20} />}
          variant="contained"
        >
          {t(translations.generateQuestion)}
        </Button>
      </div>
    </Paper>
  );
};

export default GenerateMrqConversation;
