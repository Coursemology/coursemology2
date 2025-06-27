import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Warning } from '@mui/icons-material';
import { Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

import ProgrammingFileDownloadChip from '../components/answers/Programming/ProgrammingFileDownloadChip';
import ReadOnlyEditorComponent from '../components/ReadOnlyEditor';
import { fileShape, postShape, topicShape } from '../propTypes';

const translations = defineMessages({
  sizeTooBig: {
    id: 'course.assessment.submission.answers.Programming.ProgrammingFile.sizeTooBig',
    defaultMessage: 'The file is too big and cannot be displayed.',
  },
});

class ReadOnlyEditorContainer extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.annotations !== this.props.annotations ||
      nextProps.posts !== this.props.posts ||
      nextProps.graderView !== this.props.graderView
    );
  }

  render() {
    const { answerId, file, annotations, posts, graderView } = this.props;

    if (file.highlightedContent !== null) {
      const filteredAnnotations = graderView
        ? Object.values(annotations)
        : // Students should only see published posts
          Object.values(annotations)
            .map((annotation) => {
              const publishedPostIds =
                annotation.postIds.filter(
                  (postId) =>
                    posts[postId]?.workflowState ===
                    POST_WORKFLOW_STATE.published,
                ) || [];

              return {
                ...annotation,
                postIds: publishedPostIds,
              };
            })
            .filter((annotation) => annotation.postIds.length > 0);

      return (
        <ReadOnlyEditorComponent
          annotations={filteredAnnotations}
          answerId={answerId}
          file={file}
          isUpdatingAnnotationAllowed
        />
      );
    }

    return (
      <>
        <ProgrammingFileDownloadChip file={file} />
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
  posts: PropTypes.objectOf(postShape),
  answerId: PropTypes.number.isRequired,
  file: fileShape.isRequired,
  graderView: PropTypes.bool.isRequired,
};

function mapStateToProps({ assessments: { submission } }, ownProps) {
  const { file } = ownProps;

  return {
    annotations: submission.annotations[file.id].topics,
    posts: submission.posts,
    graderView: submission.submission.graderView,
  };
}

const ReadOnlyEditor = connect(mapStateToProps)(ReadOnlyEditorContainer);
export default ReadOnlyEditor;
