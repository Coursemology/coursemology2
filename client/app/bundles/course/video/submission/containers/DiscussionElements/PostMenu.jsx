import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import PropTypes from 'prop-types';

import { deletePostFromServer, updatePost } from '../../actions/discussion';

const propTypes = {
  canUpdate: PropTypes.bool,
  canDelete: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

const defaultProps = {
  canUpdate: true,
  canDelete: true,
};

const PostMenu = (props) => {
  // Do not show if user doesn't even have options
  if (!props.canUpdate && !props.canDelete) {
    return null;
  }

  return (
    <div style={{ float: 'right' }}>
      <IconMenu
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        iconButtonElement={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {props.canUpdate && (
          <MenuItem onClick={props.onEdit} primaryText="Edit" />
        )}
        {props.canDelete && (
          <MenuItem onClick={props.onDelete} primaryText="Delete" />
        )}
      </IconMenu>
    </div>
  );
};

PostMenu.propTypes = propTypes;
PostMenu.defaultProps = defaultProps;

const containerPropTypes = {
  postId: PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
  const { canUpdate, canDelete } = state.discussion.posts.get(ownProps.postId);
  return { canUpdate, canDelete };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onEdit: () => dispatch(updatePost(ownProps.postId, { editMode: true })),
    onDelete: () => dispatch(deletePostFromServer(ownProps.postId)),
  };
}

const PostMenuContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PostMenu);

PostMenuContainer.propTypes = containerPropTypes;

export default PostMenuContainer;
