/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { grey50 } from 'material-ui/styles/colors';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import RaisedButton from 'material-ui/RaisedButton';
import {
  showMilestoneForm,
  updateMilestone,
  deleteMilestone,
  showDeleteConfirmation,
} from 'course/lesson-plan/actions';

const translations = defineMessages({
  editMilestone: {
    id: 'course.lessonPlan.MilestoneAdminTools.editMilestone',
    defaultMessage: 'Edit Milestone',
  },
  updateSuccess: {
    id: 'course.lessonPlan.MilestoneAdminTools.updateSuccess',
    defaultMessage: 'Milestone updated.',
  },
  updateFailure: {
    id: 'course.lessonPlan.MilestoneAdminTools.updateFailure',
    defaultMessage: 'Failed to update milestone.',
  },
  deleteSuccess: {
    id: 'course.lessonPlan.MilestoneAdminTools.deleteSuccess',
    defaultMessage: 'Milestone deleted.',
  },
  deleteFailure: {
    id: 'course.lessonPlan.MilestoneAdminTools.deleteFailure',
    defaultMessage: 'Failed to delete milestone.',
  },
});

const styles = {
  edit: {
    minWidth: 40,
  },
  delete: {
    minWidth: 40,
    marginLeft: 10,
    marginRight: 50,
  },
};

class MilestoneAdminTools extends React.PureComponent {
  updateMilestoneHandler = (data) => {
    const {
      dispatch,
      intl,
      milestone: { id },
    } = this.props;

    const successMessage = intl.formatMessage(translations.updateSuccess);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(updateMilestone(id, data, successMessage, failureMessage));
  };

  showEditMilestoneDialog = () => {
    const {
      dispatch,
      intl,
      milestone: { title, description, start_at },
    } = this.props;

    return dispatch(
      showMilestoneForm({
        onSubmit: this.updateMilestoneHandler,
        formTitle: intl.formatMessage(translations.editMilestone),
        initialValues: { title, description, start_at },
      }),
    );
  };

  deleteMilestoneHandler = () => {
    const {
      dispatch,
      intl,
      milestone: { id },
    } = this.props;
    const successMessage = intl.formatMessage(translations.deleteSuccess);
    const failureMessage = intl.formatMessage(translations.deleteFailure);
    const handleDelete = () =>
      dispatch(deleteMilestone(id, successMessage, failureMessage));
    return dispatch(showDeleteConfirmation(handleDelete));
  };

  render() {
    const { milestone, canManageLessonPlan } = this.props;
    if (!milestone.id || !canManageLessonPlan) {
      return null;
    }

    return (
      <span>
        <RaisedButton
          backgroundColor={grey50}
          icon={<EditIcon />}
          onClick={this.showEditMilestoneDialog}
          style={styles.edit}
        />
        <RaisedButton
          backgroundColor={grey50}
          icon={<DeleteIcon />}
          onClick={this.deleteMilestoneHandler}
          style={styles.delete}
        />
      </span>
    );
  }
}

MilestoneAdminTools.propTypes = {
  milestone: PropTypes.shape({
    id: PropTypes.number,
    description: PropTypes.string,
    start_at: PropTypes.string,
    title: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node, // Allow node containing translation
    ]),
  }),
  canManageLessonPlan: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default connect((state) => ({
  canManageLessonPlan: state.flags.canManageLessonPlan,
}))(injectIntl(MilestoneAdminTools));
