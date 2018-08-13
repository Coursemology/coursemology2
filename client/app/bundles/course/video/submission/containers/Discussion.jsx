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
import { inverseCreatedAtOrderedTopicsSelector, orderedTopicIdsSelector } from '../selectors/discussion';

const propTypes = {
  topicIds: PropTypes.arrayOf(PropTypes.string),
  scrollTopicId: PropTypes.string,
  onScroll: PropTypes.func,
};

const defaultProps = {
  topicIds: [],
  scrollTopicId: null,
};

class Discussion extends React.Component {
  constructor(props) {
    super(props);
    this.topicPane = null;
  }

  componentDidMount() {
    this.scrollToTopic();
  }

  componentDidUpdate(prevProps) {
    if (this.props.scrollTopicId === prevProps.scrollTopicId) {
      return;
    }
    this.scrollToTopic();
  }

  setRef = (topicPaneElement) => {
    this.topicPane = topicPaneElement;
  };

  scrollToTopic() {
    if (this.props.scrollTopicId === null) {
      return;
    }

    const topicElem = document.getElementById(`discussion-topic-${this.props.scrollTopicId}`);
    if (topicElem.offsetParent !== this.topicPane) {
      this.topicPane.scrollTop = topicElem.offsetTop - this.topicPane.offsetTop;
    } else {
      this.topicPane.scrollTop = topicElem.offsetTop;
    } // Setting scrollTop will trigger the onScroll callback, which typically unsets scrollTopicId thereafter
  }

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

/**
 * Returns the topic id to scroll to.
 *
 * This topic id is determined by:
 * 1) If a scrollTopicId is set in the state, it is returned
 * 2) If not, and if autoscrolling is on, return the id of the first created topic (by createdAt time) in the group of
 * topics with the largest timestamp smaller than the player progress (first topic for current player progress)
 * 3) If neither of those are present, return null
 *
 * @param state The full application state
 * @return {null|string} The topic id to scroll to
 */
function getScrollTopicId(state) {
  const scrollTopicId = state.discussion.scrolling.scrollTopicId;
  if (scrollTopicId !== null) {
    return scrollTopicId;
  }

  const autoScroll = state.discussion.scrolling.autoScroll;
  if (!autoScroll) {
    return null;
  }

  const currentPlayerProgress = state.video.playerProgress;
  const autoScrollTopic = inverseCreatedAtOrderedTopicsSelector(state)
    .findLastEntry(topic => topic.timestamp < currentPlayerProgress);

  if (autoScrollTopic === undefined) {
    return null;
  }
  return autoScrollTopic[0];
}

function mapStateToProps(state) {
  return {
    topicIds: orderedTopicIdsSelector(state),
    scrollTopicId: getScrollTopicId(state),
    scrollTopicIdSet: state.discussion.scrolling.scrollTopicId !== null,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onScroll: () => dispatch(unsetScrollTopic()),
  };
}

function mergeProps(stateProps, dispatchProps) {
  if (stateProps.scrollTopicIdSet) {
    return { ...stateProps, ...dispatchProps };
  }

  return { ...stateProps, ...dispatchProps, onScroll: null };
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Discussion);
