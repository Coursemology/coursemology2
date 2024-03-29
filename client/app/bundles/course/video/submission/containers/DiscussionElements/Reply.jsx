import { connect } from 'react-redux';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import { addReply } from '../../actions/discussion';

import NewReplyContainer from './NewReplyContainer';
import styles from '../Discussion.scss';

const propTypes = {
  topicId: PropTypes.string.isRequired,
  editorVisible: PropTypes.bool,
  onTriggerReply: PropTypes.func,
};

const defaultProps = {
  editorVisible: false,
};

const Reply = (props) =>
  props.editorVisible ? (
    <div className={styles.replyContainer}>
      <NewReplyContainer topicId={props.topicId} />
    </div>
  ) : (
    <div className={styles.replyContainer}>
      <Button color="primary" onClick={props.onTriggerReply}>
        Reply
      </Button>
    </div>
  );

Reply.propTypes = propTypes;
Reply.defaultProps = defaultProps;

const containerPropTypes = {
  topicId: PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
  const pendingReply = state.discussion.pendingReplyPosts.get(ownProps.topicId);
  return {
    topicId: ownProps.topicId,
    editorVisible: pendingReply !== undefined && pendingReply.editorVisible,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onTriggerReply: () => dispatch(addReply(ownProps.topicId)),
  };
}

const ReplyContainer = connect(mapStateToProps, mapDispatchToProps)(Reply);

ReplyContainer.propTypes = containerPropTypes;

export default ReplyContainer;
