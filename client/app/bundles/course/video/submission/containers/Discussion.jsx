import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';

import styles from './Discussion.scss';
import NewPostContainer from './DiscussionElements/NewPostContainer';
import Topic from './DiscussionElements/Topic';
import Controls from './DiscussionElements/Controls';

const propTypes = {
  topicIds: PropTypes.arrayOf(PropTypes.string),
  autoScroll: PropTypes.bool,
};

const defaultProps = {
  topicIds: [],
  autoScroll: false,
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
    }
  }

  setRef = (topicPaneElement) => {
    this.topicPane = topicPaneElement;
  };

  render() {
    return (
      <Paper zDepth={2} className={styles.rootContainer}>
        <div
          ref={this.setRef}
          className={styles.topicsContainer}
          style={{ overflowY: this.props.autoScroll ? 'hidden' : 'scroll' }}
        >
          {this.props.topicIds.map(id => <Topic key={id.toString()} topicId={id} />)}
        </div>
        <Divider />
        <div className={styles.newCommentEditor}>
          <NewPostContainer>
            <Controls />
          </NewPostContainer>
        </div>
      </Paper>
    );
  }
}

Discussion.propTypes = propTypes;
Discussion.defaultProps = defaultProps;

function mapStateToProps(state) {
  // TODO: Use reselect
  const currentTime = state.video.playerProgress;

  const sortedKeys = state.discussion.topics
    .filter(topic => topic.topLevelPostIds.length > 0)
    .filter(topic => !state.discussion.autoScroll || topic.timestamp <= currentTime)
    .sort((topic1, topic2) => topic1.timestamp - topic2.timestamp)
    .keySeq()
    .toArray();
  return {
    topicIds: sortedKeys,
    autoScroll: state.discussion.autoScroll,
  };
}

export default connect(mapStateToProps)(Discussion);
