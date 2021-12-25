import { defineMessages, FormattedMessage } from 'react-intl';
import { orange100, red100 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

const translations = defineMessages({
  postEdited: {
    id: 'course.assessment.submission.answer.forumPostResponse.postEdited',
    defaultMessage:
      'Post has been edited in the forums. Showing post saved at point of submission.',
  },
  postDeleted: {
    id: 'course.assessment.submission.answer.forumPostResponse.postDeleted',
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
    backgroundColor: orange100,
  },
  labelDeleted: {
    backgroundColor: red100,
  },
  iconWidth: {
    width: 20,
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
          <i
            aria-hidden="true"
            className="fa fa-refresh"
            style={styles.iconWidth}
          />
          <div>
            <FormattedMessage {...translations.postEdited} />
          </div>
        </div>
      )}
      {isPostDeleted && (
        <div style={{ ...styles.label, ...styles.labelDeleted }}>
          <i
            aria-hidden="true"
            className="fa fa-trash"
            style={styles.iconWidth}
          />
          <div>
            <FormattedMessage {...translations.postDeleted} />
          </div>
        </div>
      )}
    </>
  );
};

Labels.propTypes = {
  post: PropTypes.object.isRequired,
};

export default Labels;
