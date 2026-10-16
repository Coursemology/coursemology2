import { ErrorCode, FileRejection } from 'react-dropzone';
import { Controller, useFormContext } from 'react-hook-form';
import Mic from '@mui/icons-material/Mic';
import Stop from '@mui/icons-material/Stop';
import { Button, Typography } from '@mui/material';

import FormSingleFileInput, {
  PreviewComponentProps,
} from 'lib/components/form/fields/SingleFileInput';
import AudioPreview from 'lib/components/form/fields/SingleFileInput/AudioPreview';
import { MAX_VOICE_RESPONSE_FILE_SIZE } from 'lib/constants/sharedConstants';
import toast from 'lib/hooks/toast';
import useTranslation, {
  Descriptor,
  MessageTranslator,
} from 'lib/hooks/useTranslation';

import recorderHelper, {
  MicrophoneError,
} from '../../../../utils/recorderHelper';
import { VoiceResponseAnswerProps } from '../types';

import translations from './translations';
import useVoiceRecorder from './useVoiceRecorder';

// Common audio formats, keyed by standard MIME type. The extensions also admit files whose MIME type the
// OS reports differently, such as .webm as video/webm.
const ACCEPTED_AUDIO = {
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/mp4': ['.m4a', '.mp4'],
  'audio/aac': ['.aac'],
  'audio/ogg': ['.ogg', '.oga', '.opus'],
  'audio/webm': ['.webm'],
  'audio/flac': ['.flac'],
};

// As shown to students, e.g. "15 MB".
const maxSize = `${MAX_VOICE_RESPONSE_FILE_SIZE / 1_000_000} MB`;

const MICROPHONE_ERROR_MESSAGES: Record<MicrophoneError, Descriptor> = {
  NotAllowedError: translations.microphoneBlocked,
  NotFoundError: translations.microphoneNotFound,
  OtherError: translations.microphoneUnavailable,
};

// The form value, in the shape FormSingleFileInput reads and writes. `file` is set only when a new file
// was recorded or picked; `url` and `name` describe the one already saved.
export interface VoiceResponseFileValue {
  url: string | null;
  name: string;
  file?: File | null;
}

interface VoiceResponseProps
  extends Omit<VoiceResponseAnswerProps, 'answerId'> {
  answerId: number;
}

const checkVoiceResponseRecorded = (
  value: VoiceResponseFileValue | undefined,
  t: MessageTranslator,
): true | string =>
  value?.url || value?.file instanceof File
    ? true
    : t(translations.pleaseRecordYourVoice);

const SingleFileInputChildren = ({
  file,
}: PreviewComponentProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Typography component="div" variant="body1">
      <div>{t(translations.chooseVoiceFileExplain)}</div>
      {file?.name}
    </Typography>
  );
};

const VoiceResponseAnswer = (props: VoiceResponseProps): JSX.Element => {
  const { answerId, question, readOnly, saveAnswerAndUpdateClientVersion } =
    props;
  const { t } = useTranslation();
  const { control } = useFormContext();
  const recorder = useVoiceRecorder(question.id);
  const canRecord = recorderHelper.isRecordingSupported();

  return (
    <Controller
      control={control}
      name={`${answerId}.file`}
      render={({ field, fieldState }): JSX.Element => {
        const value = field.value as VoiceResponseFileValue | undefined;

        const onChange = (newValue: VoiceResponseFileValue): void => {
          field.onChange(newValue);
          saveAnswerAndUpdateClientVersion(answerId);
        };

        const onRecorded = (file: File): void =>
          onChange({ url: value?.url ?? null, name: value?.name ?? '', file });

        const onLimitReached = (file: File): void => {
          onRecorded(file);
          toast.info(t(translations.recordingLimitReached, { maxSize }));
        };

        const onDropRejected = (rejections: FileRejection[]): void => {
          const tooLarge = rejections.some(({ errors }) =>
            errors.some(({ code }) => code === ErrorCode.FileTooLarge),
          );
          if (tooLarge) toast.error(t(translations.fileTooLarge, { maxSize }));
        };

        return (
          <div>
            {!readOnly && (
              <>
                <FormSingleFileInput
                  accept={ACCEPTED_AUDIO}
                  field={{ ...field, onChange }}
                  fieldState={fieldState}
                  maxSize={MAX_VOICE_RESPONSE_FILE_SIZE}
                  onDropRejected={onDropRejected}
                  previewComponent={SingleFileInputChildren}
                />

                {canRecord ? (
                  <div className="my-2 flex w-full items-center space-x-3">
                    <Button
                      color="primary"
                      disabled={recorder.isRecording}
                      onClick={(): void =>
                        recorder.onStartRecord(onLimitReached)
                      }
                      startIcon={<Mic />}
                    >
                      {t(translations.startRecording)}
                    </Button>

                    <Button
                      color="secondary"
                      disabled={!recorder.isRecordingHere}
                      onClick={(): void => recorder.onStopRecord(onRecorded)}
                      startIcon={<Stop />}
                    >
                      {t(translations.stopRecording)}
                    </Button>
                  </div>
                ) : (
                  <Typography
                    className="my-2"
                    color="text.secondary"
                    variant="body2"
                  >
                    {t(translations.recordingNotSupported)}
                  </Typography>
                )}

                {canRecord && recorder.microphoneError && (
                  <Typography className="mb-2" color="error" variant="body2">
                    {t(MICROPHONE_ERROR_MESSAGES[recorder.microphoneError])}
                  </Typography>
                )}
              </>
            )}

            <AudioPreview file={value?.file} url={value?.url} />

            {fieldState.error && (
              <div className="text-red-500">{fieldState.error.message}</div>
            )}
          </div>
        );
      }}
      rules={{
        validate: (value?: VoiceResponseFileValue): true | string =>
          checkVoiceResponseRecorded(value, t),
      }}
    />
  );
};

export default VoiceResponseAnswer;
