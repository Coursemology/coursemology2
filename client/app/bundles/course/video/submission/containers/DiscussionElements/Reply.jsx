import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';

import styles from '../Discussion.scss';
import NewReplyContainer from './NewReplyContainer';
import { addReply } from '../../actions/discussion';

const propTypes = {
  parentId: PropTypes.string.isRequired,
  editorVisible: PropTypes.bool,
  onTriggerReply: PropTypes.func,
};

const defaultProps = {
  editorVisible: false,
};

function Reply(props) {
  return props.editorVisible ? (
    <div className={styles.replyContainer}>
      <NewReplyContainer parentId={props.parentId} />
    </div>
  ) : (
    <div className={styles.replyContainer}>
      <FlatButton
        label="Reply"
        primary
        onClick={props.onTriggerReply}
      />
    </div>
  );
}

Reply.propTypes = propTypes;
Reply.defaultProps = defaultProps;

const containerPropTypes = {
  parentId: PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
  const pendingReply = state.discussion.pendingReplyPosts.get(ownProps.parentId);
  return {
    parentId: ownProps.parentId,
    editorVisible: (pendingReply !== undefined) && pendingReply.editorVisible,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onTriggerReply: () => dispatch(addReply(ownProps.parentId)),
  };
}

const ReplyContainer = connect(mapStateToProps, mapDispatchToProps)(Reply);

ReplyContainer.propTypes = containerPropTypes;

export default ReplyContainer;
