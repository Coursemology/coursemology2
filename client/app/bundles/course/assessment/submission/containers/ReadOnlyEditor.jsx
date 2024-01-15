import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Warning } from '@mui/icons-material';
import { Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import ProgrammingFileDownloadLink from '../components/answers/Programming/ProgrammingFileDownloadLink';
import ReadOnlyEditorComponent from '../components/ReadOnlyEditor';
import { fileShape, topicShape } from '../propTypes';

const translations = defineMessages({
  sizeTooBig: {
    id: 'course.assessment.submission.answers.Programming.ProgrammingFile.sizeTooBig',
    defaultMessage: 'The file is too big and cannot be displayed.',
  },
});

class ReadOnlyEditorContainer extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.annotations !== this.props.annotations;
  }

  render() {
    const { answerId, file, annotations } = this.props;

    if (file.highlightedContent) {
      return (
        <ReadOnlyEditorComponent
          annotations={Object.values(annotations)}
          answerId={answerId}
          file={file}
        />
      );
    }

    return (
      <>
        <ProgrammingFileDownloadLink file={file} />
        <Paper className="flex items-center bg-yellow-100 p-2">
          <Warning />
          <Typography variant="body2">
            <FormattedMessage {...translations.sizeTooBig} />
          </Typography>
        </Paper>
      </>
    );
  }
}

ReadOnlyEditorContainer.propTypes = {
  annotations: PropTypes.objectOf(topicShape),
  answerId: PropTypes.number.isRequired,
  file: fileShape.isRequired,
};

function mapStateToProps({ assessments: { submission } }, ownProps) {
  const { file } = ownProps;

  return {
    annotations: submission.annotations[file.id].topics,
  };
}

const ReadOnlyEditor = connect(mapStateToProps)(ReadOnlyEditorContainer);
export default ReadOnlyEditor;
