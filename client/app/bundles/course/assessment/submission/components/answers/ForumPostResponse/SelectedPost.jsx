import React from 'react';

import { getForumTopicURL, getForumURL } from 'lib/helpers/url-builders';
import Labels from 'course/assessment/submission/components/answers/ForumPostResponse/Labels';
import ForumPost from 'course/forum/components/ForumPost';
import ParentPost from 'course/assessment/submission/components/answers/ForumPostResponse/ParentPost';
import { getCourseId } from 'lib/helpers/url-helpers';
import { postPackShape } from 'course/assessment/submission/propTypes';
import PropTypes from 'prop-types';

const styles = {
  label: {
    border: '1px solid #B0BEC5',
    padding: '5px 16px',
    backgroundColor: '#F9FBE7',
    cursor: 'pointer',
  },
  trashIcon: {
    color: '#C2185B',
    cursor: 'pointer',
  },
};

export default class SelectedPost extends React.Component {
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
    return !this.props.readOnly ? (
      <div className="pull-right">
        <i
          className="fa fa-trash"
          style={styles.trashIcon}
          onClick={() => this.props.onRemovePostPack()}
        />
      </div>
    ) : null;
  }

  renderLink(url, name) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={() => this.handleTogglePostView()}
      >
        {name} <i className="fa fa-external-link" />
      </a>
    );
  }

  renderLabel() {
    const { postPack } = this.props;
    const { forum, topic } = postPack;
    const courseId = getCourseId();

    if (topic.isDeleted) {
      return <>Post made under a topic which was subsequently deleted.</>;
    }

    return (
      <>
        <i
          className={
            this.state.isExpanded ? 'fa fa-angle-down' : 'fa fa-angle-right'
          }
          style={{ width: 20 }}
        />
        <span>
          Post made under{' '}
          {this.renderLink(
            getForumTopicURL(courseId, forum.id, topic.id),
            topic.title,
          )}{' '}
          in {this.renderLink(getForumURL(courseId, forum.id), forum.name)}
        </span>
      </>
    );
  }

  render() {
    const { postPack } = this.props;

    return (
      <>
        <div style={styles.label} onClick={() => this.handleTogglePostView()}>
          {this.renderLabel()}
          {this.renderTrashIcon()}
        </div>
        {this.state.isExpanded && (
          <>
            <Labels post={postPack.corePost} />
            <ForumPost post={postPack.corePost} />
            {postPack.parentPost && <ParentPost post={postPack.parentPost} />}
          </>
        )}
        <br />
      </>
    );
  }
}

SelectedPost.propTypes = {
  postPack: postPackShape,
  readOnly: PropTypes.bool,
  onRemovePostPack: PropTypes.func,
};
