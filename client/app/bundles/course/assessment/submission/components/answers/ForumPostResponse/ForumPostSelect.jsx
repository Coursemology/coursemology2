import { Component } from 'react';
import { Button } from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import CourseAPI from 'api/course';
import { questionShape } from 'course/assessment/submission/propTypes';
import ForumPostSelectDialog from './ForumPostSelectDialog';
import SelectedPostCard from './SelectedPostCard';

const translations = defineMessages({
  cannotRetrieveForumPosts: {
    id: 'course.assessment.submission.answer.forumPostResponse.cannotRetrieveForumPosts',
    defaultMessage:
      'Oops! Unable to retrieve your forum posts. Please try refreshing this page.',
  },
  cannotRetrieveSelectedPostPacks: {
    id: 'course.assessment.submission.answer.forumPostResponse.cannotRetrieveSelectedPostPacks',
    defaultMessage:
      'Oops! Unable to retrieve your selected posts. Please try refreshing this page.',
  },
  submittedInstructions: {
    id: 'course.assessment.submission.answer.forumPostResponse.submittedInstructions',
    defaultMessage:
      '{numPosts, plural, =0 {No posts were} one {# post was} other {# posts were}} submitted.',
  },
  selectInstructions: {
    id: 'course.assessment.submission.answer.forumPostResponse.selectInstructions',
    defaultMessage:
      'Select {maxPosts} forum {maxPosts, plural, one {post} other {posts}}.',
  },
  selectedPostsInstructions: {
    id: 'course.assessment.submission.answer.forumPostResponse.selectedPostsInstructions',
    defaultMessage:
      'You have selected {numPosts} {numPosts, plural, one {post} other {posts}}.',
  },
  selectPostsButton: {
    id: 'course.assessment.submission.answer.forumPostResponse.selectPostsButton',
    defaultMessage: 'Select Forum {maxPosts, plural, one {Post} other {Posts}}',
  },
});

const styles = {
  root: {
    marginBottom: 16,
  },
  instruction: {
    color: grey[700],
    fontSize: 14,
    marginBottom: 12,
  },
  clipIcon: {
    color: 'white',
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
      .then((response) => {
        this.props.input.onChange(response.data.selected_post_packs);
      })
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

  renderInstruction(postPacks, maxPosts) {
    if (this.props.readOnly) {
      return (
        <div style={styles.instruction}>
          <FormattedMessage
            values={{ numPosts: postPacks.length }}
            {...translations.submittedInstructions}
          />
        </div>
      );
    }
    return (
      <div style={styles.instruction}>
        {/* TODO: Refactor the below into a single FormattedMessage once react-intl is upgraded:
            https://formatjs.io/docs/react-intl/components/#rich-text-formatting */}
        <strong>
          <FormattedMessage
            values={{ maxPosts }}
            {...translations.selectInstructions}
          />
        </strong>{' '}
        <FormattedMessage
          values={{ numPosts: postPacks.length }}
          {...translations.selectedPostsInstructions}
        />
      </div>
    );
  }

  renderSelectedPostPacks(postPacks) {
    if (!postPacks) {
      return null;
    }

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

  render() {
    const postPacks = this.props.input.value;
    const maxPosts = this.props.question.maxPosts;

    return (
      <div style={styles.root}>
        {this.renderInstruction(postPacks, maxPosts)}
        {!this.props.readOnly && (
          <>
            <Button
              variant="contained"
              color="primary"
              disabled={this.state.hasErrorFetchingPosts || maxPosts === 0}
              onClick={() => this.setState({ isDialogVisible: true })}
              startIcon={
                <i
                  className="fa fa-paperclip"
                  style={styles.clipIcon}
                  aria-hidden="true"
                />
              }
              style={{ marginBottom: 16 }}
            >
              <FormattedMessage
                values={{ maxPosts }}
                {...translations.selectPostsButton}
              />
            </Button>
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
