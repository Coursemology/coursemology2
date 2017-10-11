import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

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

function PostMenu(props) {
  // Do not show if user doesn't even have options
  if (!props.canUpdate && !props.canDelete) {
    return null;
  }

  return (
    <div style={{ float: 'right' }}>
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {props.canUpdate && <MenuItem primaryText="Edit" onClick={props.onEdit} />}
        {props.canDelete && <MenuItem primaryText="Delete" onClick={props.onDelete} />}
      </IconMenu>
    </div>
  );
}

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

const PostMenuContainer = connect(mapStateToProps, mapDispatchToProps)(PostMenu);

PostMenuContainer.propTypes = containerPropTypes;

export default PostMenuContainer;
