import React from 'react';
import PropTypes from 'prop-types';

import styles from '../Discussion.scss';
import PostContainer from './PostContainer';
import EditPostContainer from './EditPostContainer';
import PostMenu from './PostMenu';
import Reply from './Reply';

const propTypes = {
  postId: PropTypes.string.isRequired,
  userPicElement: PropTypes.string.isRequired,
  userLink: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  childrenIds: PropTypes.arrayOf(PropTypes.string),
  editMode: PropTypes.bool,
  isRoot: PropTypes.bool,
};

const defaultProps = {
  childrenId: [],
  editMode: false,
  isRoot: false,
};

function PostPresentation(props) {
  let childrenElements = null;
  if (props.isRoot) {
    const childrenNodes = props.childrenIds.map(childId => <PostContainer key={childId} postId={childId} />);
    if (childrenNodes.length > 0) {
      childrenElements = (
        <div className={styles.replyIndent}>
          {childrenNodes}
        </div>
      );
    }
  }

  return (
    <div className={styles.postContainer}>
      {props.editMode || <PostMenu postId={props.postId} />}
      <span className={styles.userPic} dangerouslySetInnerHTML={{ __html: props.userPicElement }} />
      <div className={styles.contentContainer}>
        <span dangerouslySetInnerHTML={{ __html: props.userLink }} />
        &nbsp;
        <div className={styles.postTimestamp}>{props.createdAt}</div>
        {props.editMode ? (
          <EditPostContainer postId={props.postId} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: props.content }} />
        )}
      </div>
      {childrenElements}
      {props.isRoot && <Reply parentId={props.postId} />}
    </div>
  );
}

PostPresentation.propTypes = propTypes;
PostPresentation.defaultProps = defaultProps;

export default PostPresentation;
