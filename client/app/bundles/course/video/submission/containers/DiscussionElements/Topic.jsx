import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Divider from 'material-ui/Divider';
import { formatTimestamp } from 'lib/helpers/videoHelpers';

import styles from '../Discussion.scss';
import PostContainer from './PostContainer';
import Reply from './Reply';

const propTypes = {
  topicId: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
  postIds: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  postIds: [],
};

function Topic(props) {
  if (props.postIds.length === 0) {
    return null;
  }

  return (
    <div id={`discussion-topic-${props.topicId}`} className={styles.topicComponent}>
      <div className={styles.topicTimestamp}>
        <span className="glyphicon glyphicon-chevron-down" />
        &nbsp;
        <b>Time: {formatTimestamp(props.timestamp)}</b>
        &nbsp;
        <span className="glyphicon glyphicon-chevron-down" />
      </div>
      <Divider style={{ marginBottom: '1em' }} />
      <div>
        {props.postIds.map(id => <PostContainer key={id.toString()} postId={id} isRoot />)}
      </div>
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
  const postIds = topic.topLevelPostIds.filter(postId => postsStore.has(postId));
  return {
    topicId: ownProps.topicId,
    timestamp: topic.timestamp,
    postIds,
  };
}

const TopicContainer = connect(mapStateToProps)(Topic);

TopicContainer.propTypes = containerPropTypes;

export default TopicContainer;
