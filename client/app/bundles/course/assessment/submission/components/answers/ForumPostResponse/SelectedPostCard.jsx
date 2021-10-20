import React from 'react';
import { green50, red700 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

import { postPackShape } from 'course/assessment/submission/propTypes';
import ForumPost from 'course/forum/components/ForumPost';
import { getForumTopicURL, getForumURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

import Labels from './Labels';
import ParentPost from './ParentPost';

const styles = {
  card: {
    marginBottom: 12,
    boxShadow: 'rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px',
    borderRadius: 2,
    overflow: 'hidden',
  },
  label: {
    padding: '12px 16px',
    backgroundColor: green50,
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
    color: red700,
    border: 0,
    padding: 0,
    fontSize: 16,
  },
  parentPost: {
    margin: '0px 16px 16px 16px',
  },
};

export default class SelectedPostCard extends React.Component {
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

  renderTrashIcon() {
    if (this.props.readOnly) {
      return null;
    }
    return (
      <button
        className="pull-right"
        style={styles.trashButton}
        onClick={() => this.props.onRemovePostPack()}
        type="button"
      >
        <i className="fa fa-trash" />
      </button>
    );
  }

  static renderLink(url, name) {
    let renderedName = name;
    if (renderedName.length > 30) {
      renderedName = `${renderedName.slice(0, 30)}...`;
    }
    return (
      <a href={url} target="_blank" rel="noreferrer">
        {renderedName} <i className="fa fa-external-link" />
      </a>
    );
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
          <span>Post made under a topic which was subsequently deleted.</span>
        ) : (
          <span>
            Post made under{' '}
            {SelectedPostCard.renderLink(
              getForumTopicURL(courseId, forum.id, topic.id),
              topic.title,
            )}{' '}
            in{' '}
            {SelectedPostCard.renderLink(
              getForumURL(courseId, forum.id),
              forum.name,
            )}
          </span>
        )}
      </div>
    );
  }

  render() {
    const { postPack } = this.props;

    return (
      <div style={styles.card}>
        <div style={styles.label} onClick={() => this.handleTogglePostView()}>
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
