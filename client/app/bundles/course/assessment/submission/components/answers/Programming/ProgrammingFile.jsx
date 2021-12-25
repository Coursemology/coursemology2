import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import Paper from 'material-ui/Paper';
import { yellow100 } from 'material-ui/styles/colors';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import PropTypes from 'prop-types';

import { getProgrammingFileURL } from 'lib/helpers/url-builders';

import ReadOnlyEditor from '../../../containers/ReadOnlyEditor';
import { fileShape } from '../../../propTypes';
import Editor from '../../Editor';

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
          filename={file.filename}
          language={language}
          name={`${fieldName}[content]`}
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
      <ReadOnlyEditor answerId={answerId} content={content} fileId={file.id} />
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
