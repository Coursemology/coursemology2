import { red100, orange100 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

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
            Post has been edited in the forum. Showing post saved at point of
            submission.
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
            Post has been deleted from forum topic. Showing post saved at point
            of submission.
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
