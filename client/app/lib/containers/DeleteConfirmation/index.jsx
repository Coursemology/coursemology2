import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { resetDeleteConfirmation } from 'lib/actions';

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
