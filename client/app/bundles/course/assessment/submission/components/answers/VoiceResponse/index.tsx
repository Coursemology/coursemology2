import { Component } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Mic from '@mui/icons-material/Mic';
import Stop from '@mui/icons-material/Stop';
import { Button, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import FormSingleFileInput from 'lib/components/form/fields/SingleFileInput';

import recorderHelper from '../../utils/recorderHelper';
import {
  recorderComponentMount,
  recorderComponentUnmount,
  setNotRecording,
  setRecording,
} from '../actions/answers/voiceResponse';

const translations = defineMessages({
  startRecording: {
    id: 'course.assessment.submission.VoiceResponseAnswer.startRecording',
    defaultMessage: 'Start Recording',
  },
  stopRecording: {
    id: 'course.assessment.submission.VoiceResponseAnswer.stopRecording',
    defaultMessage: 'Stop Recording',
  },
  chooseVoiceFileExplain: {
    id: 'course.assessment.submission.VoiceResponseAnswer.chooseVoiceFileExplain',
    defaultMessage:
      'Drag and drop or click to upload your WAV / MP3 files. Alternatively, use the \
                     recorder below to record your response',
  },
  pleaseRecordYourVoice: {
    id: 'course.assessment.submission.VoiceResponseAnswer.pleaseRecordYourVoice',
    defaultMessage: 'Please record your voice',
  },
});

const styles = {
  fileInputWrapper: {
    width: '100%',
  },
  singleFileInputChildrenWrapper: {
    width: '100%',
    height: '100%',
    display: 'table',
  },
  singleFileInputChildren: {
    display: 'table-cell',
    verticalAlign: 'middle',
  },
  errorStyle: {
    color: red[500],
  },
};
const checkVoiceResponseRecorded = (value, intl) => {
  const { file, url } = value;
  if (url || file instanceof File) {
    return true;
  }
  return intl.formatMessage(translations.pleaseRecordYourVoice);
};

class VoiceResponseAnswer extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(recorderComponentMount());
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(recorderComponentUnmount());
  }

  onStartRecord = () => {
    const { dispatch } = this.props;
    const recordingComponentId = this.currentRecordingComponentId();
    recorderHelper
      .startRecord()
      .then(() => dispatch(setRecording({ recordingComponentId })));
  };

  onStopRecord = (field) => () => {
    const { dispatch } = this.props;
    recorderHelper.stopRecord().then((file) => {
      const { onChange, value = {} } = field;
      const { url, name } = value;
      /**
       * check SingleFileInput about the format of the single file
       */
      onChange({ file, url, name });
      return dispatch(setNotRecording());
    });
  };

  /**
   * It is just a unique Id for each component make use of recorder
   */
  currentRecordingComponentId = () => {
    const { question } = this.props;
    return `voice_response_${question.id}`;
  };

  // eslint-disable-next-line class-methods-use-this
  renderAudio = (field) => {
    const {
      value: { file, url },
    } = field;
    let finalUrl;
    if (file) {
      finalUrl = URL.createObjectURL(file);
    } else if (url) {
      finalUrl = url;
    }
    if (finalUrl) {
      return (
        <audio controls src={finalUrl}>
          <track kind="captions" />
        </audio>
      );
    }
    return null;
  };

  renderAudioInput = (
    readOnly,
    recording,
    recordingComponentId,
    field,
    fieldState,
  ) => {
    if (readOnly) {
      return null;
    }
    const { intl } = this.props;
    return (
      <div>
        <div className="w-full">
          <FormSingleFileInput
            accept={{ 'audio/mp3': ['.mp3'], 'audio/wav': ['wav'] }}
            disabled={readOnly}
            field={field}
            fieldState={fieldState}
            previewComponent={this.renderSingleFileInputChildren}
          />
        </div>
        <div className="flex w-full items-center space-x-3 mb-2 mt-2">
          <Button
            color="primary"
            disabled={recording}
            onClick={this.onStartRecord}
          >
            <Mic />
            {intl.formatMessage(translations.startRecording)}
          </Button>

          <Button
            color="secondary"
            disabled={
              !recording ||
              recordingComponentId !== this.currentRecordingComponentId()
            }
            onClick={this.onStopRecord(field)}
          >
            <Stop />
            {intl.formatMessage(translations.stopRecording)}
          </Button>
        </div>
      </div>
    );
  };

  renderFile = ({
    field,
    fieldState,
    readOnly,
    recording,
    recordingComponentId,
  }) => {
    const error = fieldState.error;

    return (
      <div>
        {this.renderAudioInput(
          readOnly,
          recording,
          recordingComponentId,
          field,
          fieldState,
        )}
        {this.renderAudio(field)}
        {error ? <div style={styles.errorStyle}>{error.message}</div> : null}
      </div>
    );
  };

  // eslint-disable-next-line class-methods-use-this
  renderSingleFileInputChildren = (props) => (
    <div style={styles.singleFileInputChildrenWrapper}>
      <div style={styles.singleFileInputChildren}>
        <Typography variant="body1">
          <div>
            <FormattedMessage {...translations.chooseVoiceFileExplain} />
          </div>
          {props.file && props.file.name}
        </Typography>
      </div>
    </div>
  );

  render() {
    const {
      control,
      question,
      recording,
      recordingComponentId,
      readOnly,
      answerId,
      saveAnswerAndUpdateClientVersion,
      intl,
    } = this.props;
    return (
      <div>
        <Controller
          control={control}
          name={`${answerId}.file`}
          render={({ field, fieldState }) =>
            this.renderFile({
              field: {
                ...field,
                onChange: (event) => {
                  field.onChange(event);
                  saveAnswerAndUpdateClientVersion(answerId);
                },
              },
              fieldState,
              readOnly,
              answerId,
              recording,
              recordingComponentId,
              question,
            })
          }
          rules={{ validate: (v) => checkVoiceResponseRecorded(v, intl) }}
        />
      </div>
    );
  }
}

VoiceResponseAnswer.propTypes = {
  control: PropTypes.object.isRequired,
  answerId: PropTypes.number.isRequired,
  readOnly: PropTypes.bool.isRequired,
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
  dispatch: PropTypes.func.isRequired,
  recordingComponentId: PropTypes.string.isRequired,
  recording: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
  saveAnswerAndUpdateClientVersion: PropTypes.func,
};

const VoiceResponseAnswerWithFormContext = (props) => {
  const { control } = useFormContext();
  return <VoiceResponseAnswer control={control} {...props} />;
};

function mapStateToProps({ assessments: { submission } }) {
  return {
    recording: submission.recorder.recording,
    recordingComponentId: submission.recorder.recordingComponentId,
  };
}

export default connect(mapStateToProps)(
  injectIntl(VoiceResponseAnswerWithFormContext),
);
