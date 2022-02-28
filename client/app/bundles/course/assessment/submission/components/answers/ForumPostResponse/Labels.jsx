import React from 'react';
import { orange, red } from '@material-ui/core/colors';

import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

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
    backgroundColor: orange[100],
  },
  labelDeleted: {
    backgroundColor: red[100],
  },
  iconWidth: {
    width: 20,
  },
};

function Labels({ post }) {
  const isPostUpdated = post.isUpdated === true;
  const isPostDeleted = post.isDeleted === true;
  return (
    <>
      {/* Actually, a post that has been deleted will have its isUpdated as null,
          but we are checking here just to be sure.  */}
      {isPostUpdated && !isPostDeleted && (
        <div style={{ ...styles.label, ...styles.labelEdited }}>
          <i
            className="fa fa-refresh"
            aria-hidden="true"
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
            className="fa fa-trash"
            aria-hidden="true"
            style={styles.iconWidth}
          />
          <div>
            <FormattedMessage {...translations.postDeleted} />
          </div>
        </div>
      )}
    </>
  );
}

Labels.propTypes = {
  post: PropTypes.object.isRequired,
};

export default Labels;
