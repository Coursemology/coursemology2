import React from 'react';
import PropTypes from 'prop-types';

import styles from '../Discussion.scss';
import PostContainer from './PostContainer'; // eslint-disable-line import/no-cycle
import EditPostContainer from './EditPostContainer';
import PostMenu from './PostMenu';

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
  childrenIds: [],
  editMode: false,
  isRoot: false,
};

function PostPresentation(props) {
  let childrenElements = null;
  const childrenNodes = props.childrenIds.map(childId => <PostContainer key={childId} postId={childId} />);
  if (childrenNodes.length > 0) {
    childrenElements = (
      <div className={props.isRoot ? styles.replyIndent : undefined}>
        {childrenNodes}
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}

PostPresentation.propTypes = propTypes;
PostPresentation.defaultProps = defaultProps;

export default PostPresentation;
