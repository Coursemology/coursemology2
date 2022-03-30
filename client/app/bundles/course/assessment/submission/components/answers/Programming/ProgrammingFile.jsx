import { Component } from 'react';
import PropTypes from 'prop-types';

import { yellow100 } from 'material-ui/styles/colors';
import Paper from 'material-ui/Paper';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import { defineMessages, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';

import { getProgrammingFileURL } from 'lib/helpers/url-builders';

import Editor from '../../Editor';
import ReadOnlyEditor from '../../../containers/ReadOnlyEditor';
import { fileShape } from '../../../propTypes';

const translations = defineMessages({
  sizeTooBig: {
    id: 'course.assessment.submission.answer.programming.sizeTooBig',
    defaultMessage: 'The file is too big and cannot be displayed.',
  },
  downloadFile: {
    id: 'course.assessment.submission.answer.programming.downloadFile',
    defaultMessage: 'Download File',
  },
});

const styles = {
  warningIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
  },
};

class ProgrammingFile extends Component {
  renderProgrammingEditor() {
    const { file, fieldName, language } = this.props;
    return (
      <>
        <h5>{file.filename}</h5>
        <Editor
          name={`${fieldName}[content]`}
          filename={file.filename}
          language={language}
        />
      </>
    );
  }

  renderReadOnlyProgrammingEditor() {
    const { file, answerId } = this.props;
    const { courseId, assessmentId, submissionId } = this.props.match.params;

    const downloadLink = getProgrammingFileURL(
      courseId,
      assessmentId,
      submissionId,
      answerId,
      file.id,
    );

    if (file.highlighted_content === null) {
      return (
        <Paper style={{ backgroundColor: yellow100, padding: 10 }}>
          <WarningIcon style={styles.warningIcon} />
          <span>
            <FormattedMessage {...translations.sizeTooBig} />
            &nbsp;
            <a href={downloadLink}>
              <FormattedMessage {...translations.downloadFile} />
            </a>
          </span>
        </Paper>
      );
    }

    const content = file.highlighted_content.split('\n');
    return (
      <ReadOnlyEditor answerId={answerId} fileId={file.id} content={content} />
    );
  }

  render() {
    if (this.props.readOnly) {
      return this.renderReadOnlyProgrammingEditor();
    }
    return this.renderProgrammingEditor();
  }
}

ProgrammingFile.propTypes = {
  file: fileShape,
  language: PropTypes.string,
  readOnly: PropTypes.bool,
  fieldName: PropTypes.string,
  answerId: PropTypes.number,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string,
      assessmentId: PropTypes.string,
      submissionId: PropTypes.string,
    }),
  }),
};

export default withRouter(ProgrammingFile);
