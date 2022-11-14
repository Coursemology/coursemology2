import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { resetDeleteConfirmation } from 'lib/actions';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

const DeleteConfirmation = ({ dispatch, deleteConfirmation }) => (
  <ConfirmationDialog
    confirmDelete
    {...deleteConfirmation}
    onCancel={() => dispatch(resetDeleteConfirmation())}
  />
);

DeleteConfirmation.propTypes = {
  dispatch: PropTypes.func.isRequired,
  deleteConfirmation: PropTypes.shape({
    open: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect((state) => ({
  deleteConfirmation: state.deleteConfirmation,
}))(DeleteConfirmation);
