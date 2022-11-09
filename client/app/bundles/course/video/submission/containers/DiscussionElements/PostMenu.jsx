import { useState } from 'react';
import { connect } from 'react-redux';
import MoreVert from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';
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
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Do not show if user doesn't even have options
  if (!props.canUpdate && !props.canDelete) {
    return null;
  }

  return (
    <div className="float-right">
      <IconButton onClick={handleClick}>
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        disableAutoFocusItem={true}
        id="post-menu"
        onClick={handleClose}
        onClose={handleClose}
        open={Boolean(anchorEl)}
      >
        {props.canUpdate && <MenuItem onClick={props.onEdit}>Edit</MenuItem>}
        {props.canDelete && (
          <MenuItem onClick={props.onDelete}>Delete</MenuItem>
        )}
      </Menu>
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
