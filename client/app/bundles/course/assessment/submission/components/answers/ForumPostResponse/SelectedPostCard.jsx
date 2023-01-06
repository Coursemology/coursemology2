import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { green, red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import { postPackShape } from 'course/assessment/submission/propTypes';
import { getForumTopicURL, getForumURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

import ForumPost from './ForumPost';
import Labels from './Labels';
import ParentPost from './ParentPost';

const MAX_NAME_LENGTH = 30;

const translations = defineMessages({
  topicDeleted: {
    id: 'course.assessment.submission.answers.ForumPostResponse.SelectedPostCard.topicDeleted',
    defaultMessage: 'Post made under a topic that was subsequently deleted.',
  },
  postMadeUnder: {
    id: 'course.assessment.submission.answers.ForumPostResponse.SelectedPostCard.postMadeUnder',
    defaultMessage: 'Post made under {topicUrl} in {forumUrl}',
  },
});

const styles = {
  card: {
    marginBottom: 12,
    boxShadow: 'rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px',
    borderRadius: 2,
    overflow: 'hidden',
  },
  label: {
    padding: '12px 16px',
    backgroundColor: green[50],
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  trashButton: {
    color: red[700],
    border: 0,
    padding: 0,
    fontSize: 16,
  },
  parentPost: {
    margin: '0px 16px 16px 16px',
  },
};

export default class SelectedPostCard extends Component {
  static renderLink(url, name) {
    let renderedName = name;
    if (renderedName.length > MAX_NAME_LENGTH) {
      renderedName = `${renderedName.slice(0, MAX_NAME_LENGTH)}...`;
    }
    return (
      <a href={url} rel="noopener noreferrer" target="_blank">
        {renderedName} <i className="fa fa-external-link" />
      </a>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
    };
  }

  handleTogglePostView() {
    this.setState((oldState) => ({
      isExpanded: !oldState.isExpanded,
    }));
  }

  renderLabel() {
    const { postPack } = this.props;
    const { forum, topic } = postPack;
    const courseId = getCourseId();

    return (
      <div style={styles.labelLeft}>
        <i
          className={
            this.state.isExpanded ? 'fa fa-angle-down' : 'fa fa-angle-right'
          }
          style={{ width: 20 }}
        />
        {topic.isDeleted ? (
          <span>
            <FormattedMessage {...translations.topicDeleted} />
          </span>
        ) : (
          <span>
            <FormattedMessage
              values={{
                topicUrl: SelectedPostCard.renderLink(
                  getForumTopicURL(courseId, forum.id, topic.id),
                  topic.title,
                ),
                forumUrl: SelectedPostCard.renderLink(
                  getForumURL(courseId, forum.id),
                  forum.name,
                ),
              }}
              {...translations.postMadeUnder}
            />
          </span>
        )}
      </div>
    );
  }

  renderTrashIcon() {
    if (this.props.readOnly) {
      return null;
    }
    return (
      <button
        className="pull-right"
        onClick={() => this.props.onRemovePostPack()}
        style={styles.trashButton}
        type="button"
      >
        <i className="fa fa-trash" />
      </button>
    );
  }

  render() {
    const { postPack } = this.props;

    return (
      <div className="selected-forum-post-card" style={styles.card}>
        <div onClick={() => this.handleTogglePostView()} style={styles.label}>
          {this.renderLabel()}
          {this.renderTrashIcon()}
        </div>
        {this.state.isExpanded && (
          <>
            <Labels post={postPack.corePost} />
            <ForumPost post={postPack.corePost} style={{ border: 0 }} />
            {postPack.parentPost && (
              <ParentPost
                post={postPack.parentPost}
                style={styles.parentPost}
              />
            )}
          </>
        )}
      </div>
    );
  }
}

SelectedPostCard.propTypes = {
  postPack: postPackShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
  onRemovePostPack: PropTypes.func.isRequired, // Even for read-only, which will simply do nothing
};
