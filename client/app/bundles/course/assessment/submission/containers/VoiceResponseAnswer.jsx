import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { red500 } from 'material-ui/styles/colors';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import MicIcon from 'material-ui/svg-icons/av/mic';
import StopIcon from 'material-ui/svg-icons/av/stop';
import SingleFileInput from 'lib/components/redux-form/SingleFileInput';
import recorderHelper from '../../utils/recorderHelper';
import sharedConstants from '../../../../../lib/constants/sharedConstants';
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
    defaultMessage: 'Drag your audio file here, or click to select an audio file. \
                     Only wav and mp3 formats are supported. Alternatively, you may use the \
                     recorder below to record your response',
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
    color: red500,
  },
};

class VoiceResponseAnswer extends Component {

  static propTypes = {
    answerId: PropTypes.number.isRequired,
    readOnly: PropTypes.bool.isRequired,
    question: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }),
    dispatch: PropTypes.func.isRequired,
    recordingComponentId: PropTypes.string.isRequired,
    recording: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,
  }

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
    recorderHelper.startRecord().then(() => dispatch(setRecording({ recordingComponentId })));
  }

  onStopRecord = field => () => {
    const { dispatch } = this.props;
    recorderHelper.stopRecord().then((file) => {
      const { input: { onChange, value = {} } } = field;
      const { url, name } = value;
      /**
       * check SingleFileInput about the format of the single file
       */
      onChange({ file, url, name });
      return dispatch((setNotRecording()));
    });
  }

  /**
   * It is just a unique Id for each component make use of recorder
   */
  currentRecordingComponentId = () => {
    const { question } = this.props;
    return `voice_response_${question.id}`;
  }

  renderSingleFileInputChildren = (field) => {
    const { input } = field;
    const { value = {} } = input;
    const { file = {} } = value;
    const { name: fileName } = file;
    return (
      <div style={styles.singleFileInputChildrenWrapper}>
        <div style={styles.singleFileInputChildren}>
          <div>
            <FormattedMessage {...translations.chooseVoiceFileExplain} />
          </div>
          {fileName}
        </div>
      </div>
    );
  }

  renderAudio = (field) => {
    const { input: { value } } = field;
    const { file, url } = value;
    let finalUrl;
    if (file) {
      finalUrl = URL.createObjectURL(file);
    } else if (url) {
      finalUrl = url;
    }
    if (finalUrl) {
      return (<audio
        controls
        src={finalUrl}
      >
        <track kind="captions" />
      </audio>);
    }
    return null;
  }

  renderAudioInput = (readOnly, recording, recordingComponentId, field) => {
    if (readOnly) {
      return null;
    }
    const { intl } = this.props;
    return (
      <div>
        <div style={styles.fileInputWrapper}>
          <SingleFileInput
            disabled={readOnly}
            accept={sharedConstants.SUPPORTED_VOICE_FILE_TYPES.join()}
            {...field}
          >
            {this.renderSingleFileInputChildren(field)}
          </SingleFileInput>
        </div>
        <div>
          <FlatButton
            primary
            disabled={recording}
            icon={<MicIcon />}
            label={intl.formatMessage(translations.startRecording)}
            onTouchTap={this.onStartRecord}
          />
          <FlatButton
            primary
            secondary
            icon={<StopIcon />}
            label={intl.formatMessage(translations.stopRecording)}
            disabled={!recording || recordingComponentId !== this.currentRecordingComponentId()}
            onTouchTap={this.onStopRecord(field)}
          />
        </div>
      </div>
    );
  }

  renderFile = ({ readOnly, recording, recordingComponentId, ...field }) => {
    const error = field && field.meta && field.meta.error;
    const touched = field && field.meta && field.meta.touched;
    return (
      <div>
        {this.renderAudioInput(readOnly, recording, recordingComponentId, field)}
        {this.renderAudio(field)}
        { touched && error ? <div style={styles.errorStyle}><FormattedMessage {...error} /></div> : null }
      </div>
    );
  }

  render() {
    const { question, recording, recordingComponentId, readOnly, answerId } = this.props;
    return (
      <div>
        <Field
          name={`${answerId}.file`}
          readOnly={readOnly}
          answerId={answerId}
          recording={recording}
          recordingComponentId={recordingComponentId}
          question={question}
          component={this.renderFile}
        />
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    recording: state.recorder.recording,
    recordingComponentId: state.recorder.recordingComponentId,
  };
}

export default connect(mapStateToProps)(injectIntl(VoiceResponseAnswer));
