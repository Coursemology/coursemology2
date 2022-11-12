import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { forumPostShape } from 'course/assessment/submission/propTypes';
import ForumPost from './ForumPost';
import Labels from './Labels';

const translations = defineMessages({
  postMadeInResponseTo: {
    id: 'course.assessment.submission.answer.forumPostResponse.postMadeInResponseTo',
    defaultMessage: 'Post made in response to:',
  },
});

const styles = {
  parentPost: {
    marginLeft: 42,
    marginTop: 12,
  },
  subtext: {
    color: '#aaa',
  },
  post: {
    border: '1px dashed #ddd',
    opacity: 0.8,
  },
};

const ParentPost = ({ post, style = {} }) => (
  <div style={{ ...styles.parentPost, ...style }}>
    <p style={styles.subtext}>
      <FormattedMessage {...translations.postMadeInResponseTo} />
    </p>
    <Labels post={post} />
    <ForumPost post={post} isExpandable style={styles.post} />
  </div>
);

ParentPost.propTypes = {
  post: forumPostShape.isRequired,
  style: PropTypes.object,
};

export default ParentPost;
