import { FC } from 'react';
import { Control, Controller } from 'react-hook-form';
import DoneAll from '@mui/icons-material/DoneAll';
import {
  Box,
  Button,
  Paper,
  TextareaAutosize,
  Typography,
} from '@mui/material';
import { green, grey, yellow } from '@mui/material/colors';

import Accordion from 'lib/components/core/layouts/Accordion';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import FormSelectField from 'lib/components/form/fields/SelectField';
import useTranslation from 'lib/hooks/useTranslation';

import { CodaveriGenerateFormData, SnapshotState } from './types';

interface Props {
  onGenerate: () => Promise<void>;
  languageId: number;
  control: Control<CodaveriGenerateFormData>;
  languages: object[];
  snapshots: { [id: string]: SnapshotState };
  activeSnapshotId: string;
  latestSnapshotId: string;
  onClickSnapshot: (snapshot: SnapshotState) => void;
}

const itemStyles = {
  common: {
    borderStyle: 'solid',
    borderWidth: 1.0,
    borderColor: grey[400],
    borderRadius: 2,
    boxShadow: 'none',
    marginY: 1,
    padding: 1,
    width: '100%',
  },
  success: {
    backgroundColor: green[50],
  },
  active: {
    backgroundColor: yellow[100],
  },
  inactive: {
    opacity: 0.5,
  },
};

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
          let itemStyle = itemStyles.common;
          if (
            snapshot.state === 'success' &&
            snapshot.id === activeSnapshotId
          ) {
            itemStyle = { ...itemStyles.common, ...itemStyles.active };
          }
          return (
            <Paper
              key={snapshot.id}
              onClick={() => onClickSnapshot(snapshot)}
              sx={itemStyle}
            >
              <Typography className="line-clamp-4">
                {snapshot.state === 'generating' && (
                  <LoadingIndicator
                    bare
                    className="mr-2 text-gray-600"
                    size={15}
                  />
                )}
                {snapshot.state === 'success' && (
                  <DoneAll className="mr-1 text-gray-600" fontSize="small" />
                )}
                {snapshot.codaveriData?.customPrompt}
              </Typography>
            </Paper>
          );
        })}
        {inactiveSnapshotsToRender.length > 0 && (
          <Accordion
            sx={{
              '& .MuiAccordionSummary-root': {
                paddingX: '1rem !important',
                paddingY: '0.5rem !important',
              },
            }}
            title="Show inactive items"
          >
            {inactiveSnapshotsToRender.map((snapshot) => {
              const itemStyle = {
                ...itemStyles.common,
                ...itemStyles.inactive,
              };
              return (
                <Paper
                  key={snapshot.id}
                  onClick={() => onClickSnapshot(snapshot)}
                  sx={itemStyle}
                >
                  <Typography className="line-clamp-4">
                    {snapshot.state === 'generating' && (
                      <LoadingIndicator
                        bare
                        className="mr-2 text-gray-600"
                        size={15}
                      />
                    )}
                    {snapshot.state === 'success' && (
                      <DoneAll
                        className="mr-1 text-gray-600"
                        fontSize="small"
                      />
                    )}
                    {snapshot?.codaveriData?.customPrompt}
                  </Typography>
                </Paper>
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
            placeholder="Type something here..."
            style={{
              resize: 'none',
              padding: '8px',
              fontSize: '16px',
              marginBottom: '8px',
              width: '100%',
            }}
            value={value}
          />
        )}
      />
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
              label="Language"
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
          Generate
        </Button>
      </div>
    </Paper>
  );
};

export default GenerateConversation;
