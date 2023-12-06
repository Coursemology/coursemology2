import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import Warning from '@mui/icons-material/Warning';
import { Paper, Typography } from '@mui/material';
import { yellow } from '@mui/material/colors';
import PropTypes from 'prop-types';

import Link from 'lib/components/core/Link';
import withRouter from 'lib/components/navigation/withRouter';
import { getProgrammingFileURL } from 'lib/helpers/url-builders';

import ReadOnlyEditor from '../../../containers/ReadOnlyEditor';
import { fileShape } from '../../../propTypes';
import Editor from '../../Editor';

const translations = defineMessages({
  sizeTooBig: {
    id: 'course.assessment.submission.answers.Programming.ProgrammingFile.sizeTooBig',
    defaultMessage: 'The file is too big and cannot be displayed.',
  },
  downloadFile: {
    id: 'course.assessment.submission.answers.Programming.ProgrammingFile.downloadFile',
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
        <Typography>{file.filename}</Typography>
        <Editor
          filename={file.filename}
          language={language}
          name={`${fieldName}.content`}
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
        <Paper style={{ backgroundColor: yellow[100], padding: 10 }}>
          <Warning data-testid="warning-icon" style={styles.warningIcon} />
          <Typography>
            <FormattedMessage {...translations.sizeTooBig} />
            &nbsp;
            <Link href={downloadLink}>
              <FormattedMessage {...translations.downloadFile} />
            </Link>
          </Typography>
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
