import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { AttachFile } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import CourseAPI from 'api/course';
import { questionShape } from 'course/assessment/submission/propTypes';

import ForumPostSelectDialog from './ForumPostSelectDialog';
import SelectedPostCard from './SelectedPostCard';

const translations = defineMessages({
  cannotRetrieveForumPosts: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumPostSelect.cannotRetrieveForumPosts',
    defaultMessage:
      'Oops! Unable to retrieve your forum posts. Please try refreshing this page.',
  },
  cannotRetrieveSelectedPostPacks: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumPostSelect.cannotRetrieveSelectedPostPacks',
    defaultMessage:
      'Oops! Unable to retrieve your selected posts. Please try refreshing this page.',
  },
  submittedInstructions: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumPostSelect.submittedInstructions',
    defaultMessage:
      '{numPosts, plural, =0 {No posts were} one {# post was} other {# posts were}} submitted.',
  },
  selectInstructions: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumPostSelect.selectInstructions',
    defaultMessage:
      '<strong>Select {maxPosts} forum {maxPosts, plural, one {post} other {posts}}</strong>. ' +
      'You have selected {numPosts} {numPosts, plural, one {post} other {posts}}.',
  },
  selectPostsButton: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumPostSelect.selectPostsButton',
    defaultMessage: 'Select Forum {maxPosts, plural, one {Post} other {Posts}}',
  },
});

const styles = {
  root: {
    marginBottom: 16,
  },
};

export default class ForumPostSelect extends Component {
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
          <FormattedMessage {...translations.cannotRetrieveForumPosts} />,
        );
      });

    CourseAPI.assessment.answer.forumPostResponse
      .fetchSelectedPostPacks(this.props.answerId)
      .catch(() => {
        this.props.onErrorMessage(
          <FormattedMessage
            {...translations.cannotRetrieveSelectedPostPacks}
          />,
        );
      });
  }

  handleRemovePostPack(postPack) {
    if (this.props.readOnly) {
      return;
    }
    const postPacks = this.props.field.value;
    const newPostPacks = postPacks.filter(
      (pack) => pack.corePost.id !== postPack.corePost.id,
    );
    this.props.field.onChange(newPostPacks);
  }

  updatePostPackSelection(postPacks) {
    if (this.props.readOnly) {
      return;
    }
    this.props.field.onChange(postPacks);
  }

  renderInstruction(postPacks, maxPosts) {
    return (
      <Typography className="mb-5" color="text.secondary" variant="body2">
        {this.props.readOnly ? (
          <FormattedMessage
            values={{ numPosts: postPacks.length }}
            {...translations.submittedInstructions}
          />
        ) : (
          <FormattedMessage
            values={{
              maxPosts,
              numPosts: postPacks.length,
              strong: (chunk) => <strong>{chunk}</strong>,
            }}
            {...translations.selectInstructions}
          />
        )}
      </Typography>
    );
  }

  renderSelectedPostPacks(postPacks) {
    if (!postPacks) {
      return null;
    }

    return postPacks.map((postPack) => (
      <div key={`selected-post-pack-${postPack.corePost.id}`}>
        <SelectedPostCard
          onRemovePostPack={() => this.handleRemovePostPack(postPack)}
          postPack={postPack}
          readOnly={this.props.readOnly}
        />
      </div>
    ));
  }

  render() {
    const postPacks = this.props.field.value;
    const maxPosts = this.props.question.maxPosts;

    return (
      <div style={styles.root}>
        {this.renderInstruction(postPacks, maxPosts)}
        {!this.props.readOnly && (
          <>
            <Button
              color="primary"
              disabled={this.state.hasErrorFetchingPosts || maxPosts === 0}
              onClick={() => this.setState({ isDialogVisible: true })}
              startIcon={<AttachFile aria-hidden="true" />}
              style={{ marginBottom: 16 }}
              variant="contained"
            >
              <FormattedMessage
                values={{ maxPosts }}
                {...translations.selectPostsButton}
              />
            </Button>
            <ForumPostSelectDialog
              forumTopicPostPacks={this.state.forumTopicPostPacks}
              handleNotificationMessage={this.props.handleNotificationMessage}
              isVisible={this.state.isDialogVisible}
              maxPosts={this.props.question.maxPosts}
              selectedPostPacks={postPacks}
              setIsVisible={(isDialogVisible) =>
                this.setState({ isDialogVisible })
              }
              updateSelectedPostPacks={(packs) =>
                this.updatePostPackSelection(packs)
              }
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
  field: PropTypes.object.isRequired,
  onErrorMessage: PropTypes.func.isRequired,
  handleNotificationMessage: PropTypes.func.isRequired,
};
