import { Avatar, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import { formatLongDateTime } from 'lib/moment';

import EditPostContainer from './EditPostContainer';
import PostContainer from './PostContainer'; // eslint-disable-line import/no-cycle
import PostMenu from './PostMenu';
import styles from '../Discussion.scss';

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

const PostPresentation = (props) => {
  let childrenElements = null;
  const childrenNodes = props.childrenIds.map((childId) => (
    <PostContainer key={childId} postId={childId} />
  ));
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
      <div className="flex space-x-4">
        <Avatar
          alt={props.userPicElement}
          className="wh-12"
          src={props.userPicElement}
          variant="rounded"
        />
        <div className={styles.contentContainer}>
          <Typography
            dangerouslySetInnerHTML={{ __html: props.userLink }}
            display="inline"
            variant="body2"
          />
          &nbsp;
          <div className={styles.postTimestamp}>
            <Typography variant="body2">
              {formatLongDateTime(props.createdAt)}
            </Typography>
          </div>
          {props.editMode ? (
            <EditPostContainer postId={props.postId} />
          ) : (
            <Typography
              dangerouslySetInnerHTML={{ __html: props.content }}
              variant="body2"
            />
          )}
        </div>
      </div>
      {childrenElements}
    </>
  );
};

PostPresentation.propTypes = propTypes;
PostPresentation.defaultProps = defaultProps;

export default PostPresentation;
