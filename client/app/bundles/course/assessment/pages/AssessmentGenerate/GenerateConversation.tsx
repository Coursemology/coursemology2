import { FC } from 'react';
import { Control, Controller } from 'react-hook-form';
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

import { CodaveriGenerateFormData, SnapshotState } from './types';

const translations = defineMessages({
  languageField: {
    id: 'course.assessment.generation.languageField',
    defaultMessage: 'Language',
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
    <div className={className} onClick={() => onClickSnapshot(snapshot)}>
      <Typography className="line-clamp-4">
        {snapshot.state === 'generating' && (
          <LoadingIndicator bare className="mr-2 text-gray-600" size={15} />
        )}
        {snapshot.state === 'success' && (
          <DoneAll className="mr-1 text-gray-600" fontSize="small" />
        )}
        {snapshot?.codaveriData?.customPrompt}
      </Typography>
    </div>
  );
};

interface Props {
  onGenerate: () => Promise<void>;
  languageId: number;
  control: Control<CodaveriGenerateFormData>;
  languages: object[];
  snapshots: { [id: string]: SnapshotState };
  activeSnapshotId: string;
  latestSnapshotId: string;
  onClickSnapshot: (snapshot: SnapshotState) => void;
  customPrompt: string;
}

const GenerateConversation: FC<Props> = (props) => {
  const { t } = useTranslation();
  const {
    languages,
    onGenerate,
    languageId,
    control,
    snapshots,
    activeSnapshotId,
    latestSnapshotId,
    onClickSnapshot,
    customPrompt,
  } = props;

  const isGenerating = Object.values(snapshots).some(
    (snapshot) => snapshot.state === 'generating',
  );

  let traversalId: string | undefined = latestSnapshotId;
  const mainlineSnapshots: SnapshotState[] = [];
  while (traversalId !== undefined) {
    mainlineSnapshots.push(snapshots[traversalId]);
    traversalId = snapshots[traversalId].parentId;
  }
  const mainlineSnapshotsToRender = mainlineSnapshots
    .filter((snapshot) => snapshot.state !== 'sentinel')
    .reverse();
  mainlineSnapshotsToRender.push(
    ...Object.values(snapshots).filter(
      (snapshot) => snapshot.state === 'generating',
    ),
  );

  // TODO: make this more efficient using a Map
  const inactiveSnapshotsToRender = Object.values(snapshots).filter(
    (snapshot) =>
      snapshot.state !== 'sentinel' &&
      !mainlineSnapshotsToRender.some(
        (snapshot2) => snapshot.id === snapshot2.id,
      ),
  );

  return (
    <Paper
      className="p-3 mt-6 flex flex-col flex-nowrap"
      sx={{ height: { lg: 'calc(100% - 100px)' } }}
      variant="outlined"
    >
      <Box
        sx={{
          flex: '1',
          width: '100%',
          height: '100%',
          overflowY: 'scroll',
          marginY: 1,
          boxSizing: 'border-box',
        }}
      >
        {mainlineSnapshotsToRender.map((snapshot) => {
          const active =
            snapshot.state === 'success' && snapshot.id === activeSnapshotId;
          return (
            <ConversationSnapshot
              key={snapshot.id}
              className={`py-1 px-2 my-1 w-full shadow-none border border-solid border-gray-400 rounded-lg${
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
                  className={`opacity-50 py-1 px-2 my-1 w-full shadow-none border border-solid border-gray-300 rounded-lg${
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
      <Controller
        control={control}
        name="customPrompt"
        render={({ field: { onChange, value } }): JSX.Element => (
          <TextareaAutosize
            disabled={isGenerating}
            maxRows={4}
            minRows={4}
            onChange={onChange}
            placeholder={t(translations.promptPlaceholder)}
            style={{
              resize: 'none',
              padding: '8px',
              fontSize: '16px',
              width: '100%',
            }}
            value={value}
          />
        )}
      />
      <Typography className="mb-1 mt-0.5 mr-2 text-right" variant="caption">
        {customPrompt.length} / {MAX_PROMPT_LENGTH}
      </Typography>
      <div className="flex flex-nowrap">
        <Controller
          control={control}
          name="languageId"
          render={({ field, fieldState }): JSX.Element => (
            <FormSelectField
              className="mt-3 mx-0"
              disabled={isGenerating}
              field={field}
              fieldState={fieldState}
              label={t(translations.languageField)}
              options={languages}
              required
              variant="outlined"
            />
          )}
        />

        <Button
          disabled={isGenerating || languageId === 0}
          onClick={onGenerate}
          startIcon={isGenerating && <LoadingIndicator bare size={20} />}
          sx={{ maxHeight: '40px', marginTop: '25px', width: '140px' }}
          variant="contained"
        >
          {t(translations.generateQuestion)}
        </Button>
      </div>
    </Paper>
  );
};

export default GenerateConversation;
