import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Divider } from '@mui/material';
import { formatTimestamp } from 'lib/helpers/videoHelpers';

import styles from '../Discussion.scss';
import PostContainer from './PostContainer';
import Reply from './Reply';
import { seekToDirectly } from '../../actions/video';

const propTypes = {
  topicId: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
  postIds: PropTypes.arrayOf(PropTypes.string),
  onTimeStampClick: PropTypes.func,
};

const defaultProps = {
  postIds: [],
};

function Topic(props) {
  if (props.postIds.length === 0) {
    return null;
  }

  return (
    <div
      id={`discussion-topic-${props.topicId}`}
      className={styles.topicComponent}
    >
      <div className={styles.topicTimestamp}>
        <span className="glyphicon glyphicon-chevron-down" />
        &nbsp;
        <a style={{ cursor: 'pointer' }} onClick={props.onTimeStampClick}>
          <b>
            Time:
            {formatTimestamp(props.timestamp)}
          </b>
        </a>
        &nbsp;
        <span className="glyphicon glyphicon-chevron-down" />
      </div>
      <Divider style={{ marginBottom: '1em' }} />
      <>
        {props.postIds.map((id) => (
          <PostContainer key={id.toString()} postId={id} isRoot />
        ))}
      </>
      <Reply topicId={props.topicId} />
      <Divider />
    </div>
  );
}

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
