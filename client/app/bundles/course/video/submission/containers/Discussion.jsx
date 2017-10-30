import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';

import styles from './Discussion.scss';
import NewPostContainer from './DiscussionElements/NewPostContainer';
import Topic from './DiscussionElements/Topic';
import Controls from './DiscussionElements/Controls';
import { unsetScrollTopic } from '../actions/discussion';

const propTypes = {
  topicIds: PropTypes.arrayOf(PropTypes.string),
  autoScroll: PropTypes.bool,
  scrollTopicId: PropTypes.string,
  onScroll: PropTypes.func,
};

const defaultProps = {
  topicIds: [],
  autoScroll: false,
  scrollTopicId: null,
};

class Discussion extends React.Component {
  constructor(props) {
    super(props);
    this.topicPane = null;
  }

  componentWillUpdate(nextProps) {
    if (this.props.autoScroll && !nextProps.autoScroll) {
      this.savedAutoScrollPos = this.topicPane.scrollTop;
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.autoScroll && prevProps.autoScroll) {
      this.topicPane.scrollTop = this.savedAutoScrollPos;
    } else if (this.props.autoScroll) {
      this.topicPane.scrollTop = this.topicPane.scrollHeight;
    } else if (this.props.scrollTopicId !== null) {
      const topicElem = document.getElementById(`discussion-topic-${this.props.scrollTopicId}`);
      this.topicPane.scrollTop = topicElem.offsetTop;
    }
  }

  setRef = (topicPaneElement) => {
    this.topicPane = topicPaneElement;
  };

  render() {
    return (
      <Paper zDepth={2} className={styles.rootContainer}>
        <div className={styles.newCommentEditor}>
          <NewPostContainer>
            <Controls />
          </NewPostContainer>
        </div>
        <Divider />
        <div
          ref={this.setRef}
          className={styles.topicsContainer}
          style={{ overflowY: this.props.autoScroll ? 'hidden' : 'scroll' }}
          onScroll={this.props.onScroll}
        >
          {this.props.topicIds.map(id => <Topic key={id.toString()} topicId={id} />)}
        </div>
      </Paper>
    );
  }
}

Discussion.propTypes = propTypes;
Discussion.defaultProps = defaultProps;

function mapStateToProps(state) {
  // TODO: Use reselect
  const scrolling = state.discussion.scrolling;
  const currentTime = state.video.playerProgress;

  const sortedKeys = state.discussion.topics
    .filter(topic => topic.topLevelPostIds.length > 0)
    .filter(topic => !scrolling.autoScroll || topic.timestamp <= currentTime)
    .sort((topic1, topic2) => topic1.timestamp - topic2.timestamp)
    .keySeq()
    .toArray();
  return {
    topicIds: sortedKeys,
    autoScroll: scrolling.autoScroll,
    scrollTopicId: scrolling.topicId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onScroll: () => dispatch(unsetScrollTopic()),
  };
}

function mergeProps(stateProps, dispatchProps) {
  if (stateProps.scrollTopicId === null) {
    return Object.assign({}, stateProps, dispatchProps, { onScroll: null });
  }

  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Discussion);
