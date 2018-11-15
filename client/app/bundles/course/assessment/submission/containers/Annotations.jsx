import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Card, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import { defineMessages, FormattedMessage } from 'react-intl';

import { postShape, annotationShape } from '../propTypes';
import CommentCard from '../components/CommentCard';
import CommentField from '../components/CommentField';
import * as annotationActions from '../actions/annotations';

const translations = defineMessages({
  comment: {
    id: 'course.assessment.submission.commentField.comment',
    defaultMessage: 'Add Comment',
  },
});

const styles = {
  card: {
    minWidth: 250,
  },
};

class VisibleAnnotations extends Component {
  constructor(props) {
    super(props);
    this.state = { fieldVisible: false };
  }

  render() {
    const { fieldVisible } = this.state;
    const {
      fileId, lineNumber, commentForms, posts,
      createComment, updateComment, deleteComment,
      handleCreateChange, handleUpdateChange, airMode,
    } = this.props;

    return (
      <Card
        style={styles.card}
      >
        <CardText style={{ textAlign: 'left' }}>
          {posts.map(post => (
            <CommentCard
              key={post.id}
              post={post}
              editValue={commentForms.posts[post.id]}
              updateComment={value => updateComment(post.id, value)}
              deleteComment={() => deleteComment(post.id)}
              handleChange={value => handleUpdateChange(post.id, value)}
              airMode={airMode}
            />
          ))}
          {posts.length === 0 || fieldVisible ? (
            <CommentField
              value={commentForms.annotations[fileId][lineNumber]}
              isSubmitting={commentForms.isSubmitting}
              createComment={createComment}
              handleChange={handleCreateChange}
              airMode={airMode}
            />
          ) : (
            <RaisedButton
              primary
              label={<FormattedMessage {...translations.comment} />}
              onClick={() => this.setState({ fieldVisible: true })}
            />
          )}
        </CardText>
      </Card>
    );
  }
}

VisibleAnnotations.propTypes = {
  commentForms: PropTypes.shape({
    topics: PropTypes.objectOf(PropTypes.string),
    posts: PropTypes.objectOf(PropTypes.string),
  }),
  fileId: PropTypes.number.isRequired,
  lineNumber: PropTypes.number.isRequired,
  airMode: PropTypes.bool,
  posts: PropTypes.arrayOf(postShape),
  /* eslint-disable react/no-unused-prop-types */
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string,
      assessmentId: PropTypes.string,
      submissionId: PropTypes.string,
    }),
  }),
  annotation: annotationShape,
  answerId: PropTypes.number.isRequired,
  /* eslint-enable react/no-unused-prop-types */

  handleCreateChange: PropTypes.func.isRequired,
  handleUpdateChange: PropTypes.func.isRequired,
  createComment: PropTypes.func.isRequired,
  updateComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
};

VisibleAnnotations.defaultProps = {
  airMode: true,
};

function mapStateToProps(state, ownProps) {
  const { annotation } = ownProps;

  if (!annotation) {
    return {
      commentForms: state.commentForms,
      posts: [],
    };
  }
  return {
    commentForms: state.commentForms,
    posts: annotation.postIds.map(postId => state.posts[postId]),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const { match: { params: { submissionId } }, answerId, fileId, lineNumber, annotation } = ownProps;

  if (!annotation) {
    return {
      handleCreateChange: comment => dispatch(annotationActions.onCreateChange(fileId, lineNumber, comment)),
      handleUpdateChange: (postId, comment) => dispatch(annotationActions.onUpdateChange(postId, comment)),
      createComment: comment => dispatch(annotationActions.create(submissionId, answerId, fileId, lineNumber, comment)),
      updateComment: () => {},
      deleteComment: () => {},
    };
  }
  return {
    handleCreateChange: comment => dispatch(annotationActions.onCreateChange(fileId, lineNumber, comment)),
    handleUpdateChange: (postId, comment) => dispatch(annotationActions.onUpdateChange(postId, comment)),
    createComment: comment => dispatch(annotationActions.create(submissionId, answerId, fileId, lineNumber, comment)),
    updateComment: (postId, comment) => dispatch(annotationActions.update(annotation.id, postId, comment)),
    deleteComment: postId => dispatch(annotationActions.destroy(fileId, annotation.id, postId)),
  };
}

const Annotations = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(VisibleAnnotations));
export default Annotations;
