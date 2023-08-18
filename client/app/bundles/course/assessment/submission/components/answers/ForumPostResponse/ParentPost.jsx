import { defineMessages, FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

import { forumPostShape } from 'course/assessment/submission/propTypes';

import ForumPost from './ForumPost';
import Labels from './Labels';

const translations = defineMessages({
  postMadeInResponseTo: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ParentPost.postMadeInResponseTo',
    defaultMessage: 'Post made in response to:',
  },
});

const styles = {
  parentPost: {
    marginLeft: 42,
    marginTop: 12,
  },
  post: {
    border: '1px dashed #ddd',
    opacity: 0.8,
  },
};

const ParentPost = ({ post, style = {} }) => (
  <div style={{ ...styles.parentPost, ...style }}>
    <Typography className="mb-5" color="text.secondary" variant="body2">
      <FormattedMessage {...translations.postMadeInResponseTo} />
    </Typography>
    <Labels post={post} />
    <ForumPost isExpandable post={post} style={styles.post} />
  </div>
);

ParentPost.propTypes = {
  post: forumPostShape.isRequired,
  style: PropTypes.object,
};

export default ParentPost;
