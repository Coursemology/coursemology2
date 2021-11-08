import React from 'react';
import { RaisedButton } from 'material-ui';
import { grey700 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

import CourseAPI from 'api/course';
import { questionShape } from 'course/assessment/submission/propTypes';

import ForumPostSelectDialog from './ForumPostSelectDialog';
import SelectedPostCard from './SelectedPostCard';

const styles = {
  root: {
    marginBottom: 16,
  },
  instruction: {
    color: grey700,
    fontSize: 14,
    marginBottom: 12,
  },
  clipIcon: {
    color: 'white',
  },
};

export default class ForumPostSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasErrorFetchingPosts: false,
      isDialogVisible: false,
      forumTopicPostPacks: [],
    };
  }

  componentDidMount() {
    CourseAPI.assessment.answer.forumPostResponse
      .fetchPosts()
      .then((response) => {
        this.setState({
          forumTopicPostPacks: response.data.forumTopicPostPacks,
        });
      })
      .catch(() => {
        this.setState({ hasErrorFetchingPosts: true });
        this.props.onErrorMessage(
          'Oops! Unable to retrieve your forum posts. Please try refreshing this page.',
        );
      });

    CourseAPI.assessment.answer.forumPostResponse
      .fetchSelectedPostPacks(this.props.answerId)
      .then((response) => {
        this.props.input.onChange(response.data.selectedPostPacks);
      })
      .catch(() => {
        this.props.onErrorMessage(
          'Oops! Unable to retrieve your selected posts. Please try refreshing this page.',
        );
      });
  }

  handleRemovePostPack(postPack) {
    if (this.props.readOnly) {
      return;
    }
    const postPacks = this.props.input.value;
    const newPostPacks = postPacks.filter(
      (pack) => pack.corePost.id !== postPack.corePost.id,
    );
    this.props.input.onChange(newPostPacks);
  }

  updatePostPackSelection(postPacks) {
    if (this.props.readOnly) {
      return;
    }
    this.props.input.onChange(postPacks);
  }

  renderSelectedPostPacks(postPacks) {
    return postPacks.map((postPack) => (
      <div key={`selected-post-pack-${postPack.corePost.id}`}>
        <SelectedPostCard
          postPack={postPack}
          readOnly={this.props.readOnly}
          onRemovePostPack={() => this.handleRemovePostPack(postPack)}
        />
      </div>
    ));
  }

  renderInstruction(postPacks, maxPosts) {
    if (this.props.readOnly) {
      return (
        <div style={styles.instruction}>
          {postPacks.length} post{postPacks.length === 1 ? ' was ' : 's were '}
          submitted.
        </div>
      );
    }
    return (
      <div style={styles.instruction}>
        Select {maxPosts > 1 && 'up to '}
        <strong>
          {maxPosts} forum post{maxPosts !== 1 ? 's' : ''}
        </strong>
        . You have selected {postPacks.length} post
        {postPacks.length !== 1 ? 's' : ''}.
      </div>
    );
  }

  render() {
    const postPacks = this.props.input.value;
    const maxPosts = this.props.question.maxPosts;

    return (
      <div style={styles.root}>
        {this.renderInstruction(postPacks, maxPosts)}
        {!this.props.readOnly && (
          <>
            <RaisedButton
              label={`Select Forum Post${maxPosts > 1 ? 's' : ''}`}
              icon={
                <i
                  className="fa fa-paperclip"
                  style={styles.clipIcon}
                  aria-hidden="true"
                />
              }
              primary
              onClick={() => this.setState({ isDialogVisible: true })}
              disabled={this.state.hasErrorFetchingPosts}
              style={{ marginBottom: 16 }}
            />
            <ForumPostSelectDialog
              forumTopicPostPacks={this.state.forumTopicPostPacks}
              selectedPostPacks={postPacks}
              maxPosts={this.props.question.maxPosts}
              updateSelectedPostPacks={(packs) =>
                this.updatePostPackSelection(packs)
              }
              isVisible={this.state.isDialogVisible}
              setIsVisible={(isDialogVisible) =>
                this.setState({ isDialogVisible })
              }
              handleNotificationMessage={this.props.handleNotificationMessage}
            />
          </>
        )}
        {this.renderSelectedPostPacks(postPacks)}
      </div>
    );
  }
}

ForumPostSelect.propTypes = {
  question: questionShape.isRequired,
  answerId: PropTypes.number.isRequired,
  readOnly: PropTypes.bool.isRequired,
  input: PropTypes.object.isRequired,
  onErrorMessage: PropTypes.func.isRequired,
  handleNotificationMessage: PropTypes.func.isRequired,
};
