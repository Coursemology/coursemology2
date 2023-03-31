import { defineMessages, FormattedMessage } from 'react-intl';
import { Cached, Delete } from '@mui/icons-material';
import { orange, red } from '@mui/material/colors';
import PropTypes from 'prop-types';

const translations = defineMessages({
  postEdited: {
    id: 'course.assessment.submission.answers.ForumPostResponse.Labels.postEdited',
    defaultMessage:
      'Post has been edited in the forums. Showing post saved at point of submission.',
  },
  postDeleted: {
    id: 'course.assessment.submission.answers.ForumPostResponse.Labels.postDeleted',
    defaultMessage:
      'Post has been deleted from the forum topic. Showing post saved at point of submission.',
  },
});

const styles = {
  label: {
    borderBottom: 0,
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
  },
  labelEdited: {
    backgroundColor: orange[100],
  },
  labelDeleted: {
    backgroundColor: red[100],
  },
  iconWidth: {
    width: 20,
    marginRight: 2,
  },
};

const Labels = ({ post }) => {
  const isPostUpdated = post.isUpdated === true;
  const isPostDeleted = post.isDeleted === true;
  return (
    <>
      {/* Actually, a post that has been deleted will have its isUpdated as null,
          but we are checking here just to be sure.  */}
      {isPostUpdated && !isPostDeleted && (
        <div style={{ ...styles.label, ...styles.labelEdited }}>
          <Cached style={styles.iconWidth} />
          <FormattedMessage {...translations.postEdited} />
        </div>
      )}
      {isPostDeleted && (
        <div style={{ ...styles.label, ...styles.labelDeleted }}>
          <Delete style={styles.iconWidth} />
          <FormattedMessage {...translations.postDeleted} />
        </div>
      )}
    </>
  );
};

Labels.propTypes = {
  post: PropTypes.object.isRequired,
};

export default Labels;
