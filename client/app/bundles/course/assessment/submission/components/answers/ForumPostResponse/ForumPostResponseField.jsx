import React from 'react';
import PropTypes from 'prop-types';

import CourseAPI from 'api/course';
import Snackbar from 'material-ui/Snackbar';
import SelectedPost from 'course/assessment/submission/components/answers/ForumPostResponse/SelectedPost';
import { questionShape } from 'course/assessment/submission/propTypes';

import PostSelector from './PostSelector';
import Error from './Error';

export default class ForumPostResponseField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSnackbar: false,
      hasErrorFetchingPosts: false,
      hasErrorFetchingSelectedPostPacks: false,
    };
  }

  componentDidMount() {
    CourseAPI.assessment.answer.forumPostResponse
      .fetchPosts()
      .then((response) => {
        this.setState({ ...response.data });
      })
      .catch(() => {
        this.setState({ hasErrorFetchingPosts: true });
      });

    CourseAPI.assessment.answer.forumPostResponse
      .fetchSelectedPostPacks(this.props.answerId)
      .then((response) => {
        this.props.input.onChange(response.data.selectedPostPacks);
      })
      .catch(() => {
        this.setState({ hasErrorFetchingSelectedPostPacks: true });
      });
  }

  handlePostPackSelection(postPack, isSelected) {
    if (this.props.readOnly) {
      return;
    }

    const postPacks = this.props.input.value;
    if (!isSelected) {
      if (postPacks.length >= this.props.question.maxPosts) {
        // Error if max posts have already been selected
        this.setState({ showSnackbar: true });
      } else {
        this.props.input.onChange([...postPacks, postPack]);
      }
    } else {
      this.handleRemovePostpack(postPacks);
    }
  }

  handleRequestCloseSnackbar = () => {
    this.setState({
      showSnackbar: false,
    });
  };

  handleRemovePostPack(postPack) {
    if (this.props.readOnly) {
      return;
    }

    const postPacks = this.props.input.value;
    const selectedPostpacks = postPacks.filter(
      (p) => p.corePost.id !== postPack.corePost.id,
    );
    this.props.input.onChange(selectedPostpacks);
  }

  renderSelectedPostPacks(postPacks) {
    return postPacks?.map((postPack) => (
      <div key={`selected-post-pack-${postPack.corePost.id}`}>
        <SelectedPost
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
      <div>
        <div style={{ fontSize: 15 }}>
          Select {maxPosts > 1 && 'up to '}
          <b>
            {maxPosts} forum {maxPosts === 1 ? 'post' : 'posts'}
          </b>
          . You have selected {postPacks.length}{' '}
          {postPacks.length === 1 ? 'post' : 'posts'}.
        </div>
        <br />
        {!this.props.readOnly && (
          <>
            <PostSelector
              maxPosts={this.props.question.maxPosts}
              forumTopicPostPacks={this.state.forumTopicPostPacks}
              selectedPostIds={
                postPacks && postPacks.map((postPack) => postPack.corePost.id)
              }
              onSelectPostPack={(postPackSelected, isSelected) =>
                this.handlePostPackSelection(postPackSelected, isSelected)
              }
              hasError={this.state.hasErrorFetchingPosts}
            />
            <br />
            <br />
          </>
        )}
        {this.state.hasErrorFetchingSelectedPostPacks ? (
          <Error message="Oops! Unable to retrieve your selected posts. Please try refreshing this page." />
        ) : (
          this.renderSelectedPostpacks(postPacks)
        )}
        <br />

        <Snackbar
          open={this.state.showSnackbar}
          message="You have already selected the max number of posts allowed."
          autoHideDuration={4000}
          onRequestClose={this.handleRequestCloseSnackbar}
        />
      </div>
    );
  }
}

ForumPostResponseField.propTypes = {
  question: questionShape,
  answerId: PropTypes.number,
  readOnly: PropTypes.bool,
  input: PropTypes.object,
};
