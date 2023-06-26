import { connect } from 'react-redux';
import { Divider } from '@mui/material';
import PropTypes from 'prop-types';

import Link from 'lib/components/core/Link';
import { formatTimestamp } from 'lib/helpers/videoHelpers';

import { seekToDirectly } from '../../actions/video';

import PostContainer from './PostContainer';
import Reply from './Reply';
import styles from '../Discussion.scss';

const propTypes = {
  topicId: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
  postIds: PropTypes.arrayOf(PropTypes.string),
  onTimeStampClick: PropTypes.func,
};

const defaultProps = {
  postIds: [],
};

const Topic = (props) => {
  if (props.postIds.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.topicComponent}
      id={`discussion-topic-${props.topicId}`}
    >
      <div className={styles.topicTimestamp}>
        <span className="glyphicon glyphicon-chevron-down" />
        &nbsp;
        <Link onClick={props.onTimeStampClick}>
          Time:
          {formatTimestamp(props.timestamp)}
        </Link>
        &nbsp;
        <span className="glyphicon glyphicon-chevron-down" />
      </div>
      <Divider className="mb-4" />
      {props.postIds.map((id) => (
        <PostContainer key={id.toString()} isRoot postId={id} />
      ))}
      <Reply topicId={props.topicId} />
      <Divider />
    </div>
  );
};

Topic.propTypes = propTypes;
Topic.defaultProps = defaultProps;

const containerPropTypes = {
  topicId: PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
  const topic = state.discussion.topics.get(ownProps.topicId);
  const postsStore = state.discussion.posts;
  const postIds = topic.topLevelPostIds.filter((postId) =>
    postsStore.has(postId),
  );
  return {
    topicId: ownProps.topicId,
    timestamp: topic.timestamp,
    postIds,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onTimeStampClick: (timestamp) => () => dispatch(seekToDirectly(timestamp)),
  };
}

function mergeProps(stateProps, dispatchProps) {
  return {
    ...stateProps,
    ...dispatchProps,
    onTimeStampClick: dispatchProps.onTimeStampClick(stateProps.timestamp),
  };
}

const TopicContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(Topic);

TopicContainer.propTypes = containerPropTypes;

export default TopicContainer;
