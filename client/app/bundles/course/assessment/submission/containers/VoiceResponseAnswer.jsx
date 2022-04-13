import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { Button } from '@mui/material';
import { red } from '@mui/material/colors';
import Mic from '@mui/icons-material/Mic';
import Stop from '@mui/icons-material/Stop';
import FormSingleFileInput from 'lib/components/form/fields/SingleFileInput';
import sharedConstants from 'lib/constants/sharedConstants';
import recorderHelper from '../../utils/recorderHelper';
import {
  setRecording,
  setNotRecording,
  recorderComponentMount,
  recorderComponentUnmount,
} from '../actions/index';

const translations = defineMessages({
  startRecording: {
    id: 'course.assessment.submission.answer.startRecording',
    defaultMessage: 'Start Recording',
  },
  stopRecording: {
    id: 'course.assessment.submission.answer.stopRecording',
    defaultMessage: 'Stop Recording',
  },
  chooseVoiceFileExplain: {
    id: 'course.assessment.submission.answer.chooseVoiceFileExplain',
    defaultMessage:
      'Drag your audio file here, or click to select an audio file. \
                     Only wav and mp3 formats are supported. Alternatively, you may use the \
                     recorder below to record your response',
  },
  pleaseRecordYourVoice: {
    id: 'course.assessment.submission.answer.pleaseRecordYourVoice',
    defaultMessage: 'Please record your voice',
  },
});

const styles = {
  fileInputWrapper: {
    width: '60%',
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

  renderAudio = (field) => {
    const { value } = field;
    const { file, url } = value;
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
        <div style={styles.fileInputWrapper}>
          <FormSingleFileInput
            field={field}
            fieldState={fieldState}
            disabled={readOnly}
            accept={sharedConstants.SUPPORTED_VOICE_FILE_TYPES.join()}
            previewComponent={this.renderSingleFileInputChildren}
          />
        </div>
        <div>
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

  renderSingleFileInputChildren = (props) => (
    <div style={styles.singleFileInputChildrenWrapper}>
      <div style={styles.singleFileInputChildren}>
        <div>
          <FormattedMessage {...translations.chooseVoiceFileExplain} />
        </div>
        {props.file && props.file.name}
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
      intl,
    } = this.props;
    return (
      <div>
        <Controller
          name={`${answerId}.file`}
          control={control}
          render={({ field, fieldState }) =>
            this.renderFile({
              field,
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
  intl: intlShape.isRequired,
};

const VoiceResponseAnswerWithFormContext = (props) => {
  const { control } = useFormContext();
  return <VoiceResponseAnswer control={control} {...props} />;
};

function mapStateToProps(state) {
  return {
    recording: state.recorder.recording,
    recordingComponentId: state.recorder.recordingComponentId,
  };
}

export default connect(mapStateToProps)(
  injectIntl(VoiceResponseAnswerWithFormContext),
);
