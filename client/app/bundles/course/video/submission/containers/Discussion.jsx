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
import { orderedTopicIdsSelector } from '../selectors/discussion';

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

  componentDidUpdate() {
    if (this.props.scrollTopicId !== null) {
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
  const scrolling = state.discussion.scrolling;
  return {
    topicIds: orderedTopicIdsSelector(state),
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
