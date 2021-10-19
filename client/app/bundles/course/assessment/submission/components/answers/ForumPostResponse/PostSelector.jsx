import React from 'react';
import PropTypes from 'prop-types';

import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import { forumTopicPostPackShape } from 'course/assessment/submission/propTypes';
import Error from './Error';
import Forum from './Forum';

const styles = {
  dialogTitle: {
    color: '#EEE',
    background: '#006064',
    padding: '20px 30px',
    lineHeight: '85%',
  },
  dialogContainer: {
    height: 800,
    maxHeight: '90%',
    width: 1200,
    maxWidth: '100%',
  },
};

export default class PostSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelectorOpen: false,
    };
  }

  handleToggleIsSelectorOpen = (isSelectorOpen) => {
    this.setState({ isSelectorOpen });
  };

  isExpanded(forumTopicPostPack) {
    let matched = false;
    forumTopicPostPack.topicPostPacks.forEach((topicPostPack) => {
      topicPostPack.postPacks.forEach((postPack) => {
        if (this.props.selectedPostIds.includes(postPack.corePost.id)) {
          matched = true;
        }
      });
    });
    return matched;
  }

  renderDialogTitle() {
    const { maxPosts } = this.props;
    const numPostsSelected = this.props.selectedPostIds.length;
    return (
      <div style={styles.dialogTitle}>
        <div style={{ fontSize: 23, marginBottom: 15 }}>SELECT FORUM POST</div>
        <div style={{ fontSize: 15 }}>
          Select {maxPosts > 1 && 'up to'}{' '}
          <b>
            {maxPosts} forum {maxPosts === 1 ? 'post' : 'posts'}
          </b>
          . You have selected {numPostsSelected}{' '}
          {numPostsSelected === 1 ? 'post' : 'posts'}.
        </div>
        <div style={{ fontSize: 15, color: '#ccc' }}>
          Click on the forum name, then the topic title to view the post(s) made
          by you.
        </div>
      </div>
    );
  }

  renderPostMenu() {
    const { forumTopicPostPacks } = this.props;
    return (
      <div>
        <br />
        {forumTopicPostPacks?.map((forumTopicPostPack) => (
          <Forum
            forumTopicPostPack={forumTopicPostPack}
            selectedPostIds={this.props.selectedPostIds}
            onSelectPostPack={(postPackSelected, isSelected) =>
              this.props.onSelectPostPack(postPackSelected, isSelected)
            }
            isExpanded={this.isExpanded(forumTopicPostPack)}
            key={forumTopicPostPack.forum.id}
          />
        ))}
        <br />
      </div>
    );
  }

  render() {
    const numPostsSelected = this.props.selectedPostIds.length;
    const actions = [
      <FlatButton
        label={
          numPostsSelected > 0
            ? `Select ${numPostsSelected} ${
                numPostsSelected === 1 ? 'post' : 'posts'
              }`
            : 'Cancel'
        }
        primary
        onClick={() => this.handleToggleIsSelectorOpen(false)}
        key="post-selector-button"
      />,
    ];

    return (
      <>
        <RaisedButton
          label="Select Forum Post"
          icon={<i className="fa fa-paperclip" aria-hidden="true" />}
          primary
          onClick={() => this.handleToggleIsSelectorOpen(true)}
          disabled={this.props.hasError}
        />
        {this.props.hasError && (
          <Error message="Oops! Unable to retrieve your forum posts. Please try refreshing this page." />
        )}
        <Dialog
          title={this.renderDialogTitle()}
          actions={actions}
          modal={false}
          open={this.state.isSelectorOpen}
          onRequestClose={() => this.handleToggleIsSelectorOpen(false)}
          contentStyle={styles.dialog}
          autoScrollBodyContent
        >
          <div style={styles.dialogContainer}>{this.renderPostMenu()}</div>
        </Dialog>
      </>
    );
  }
}

PostSelector.propTypes = {
  forumTopicPostPacks: PropTypes.arrayOf(forumTopicPostPackShape),
  selectedPostIds: PropTypes.arrayOf(PropTypes.number),
  maxPosts: PropTypes.number,
  onSelectPostPack: PropTypes.func,
  hasError: PropTypes.bool,
};
