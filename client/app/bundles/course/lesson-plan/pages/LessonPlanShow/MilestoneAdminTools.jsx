/* eslint-disable camelcase */
import { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import PropTypes from 'prop-types';

import { showDeleteConfirmation } from 'lib/actions';

import { deleteMilestone, updateMilestone } from '../../operations';
import { actions } from '../../store';

const translations = defineMessages({
  editMilestone: {
    id: 'course.lessonPlan.LessonPlanShow.MilestoneAdminTools.editMilestone',
    defaultMessage: 'Edit Milestone',
  },
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanShow.MilestoneAdminTools.updateSuccess',
    defaultMessage: 'Milestone updated.',
  },
  updateFailure: {
    id: 'course.lessonPlan.LessonPlanShow.MilestoneAdminTools.updateFailure',
    defaultMessage: 'Failed to update milestone.',
  },
  deleteSuccess: {
    id: 'course.lessonPlan.LessonPlanShow.MilestoneAdminTools.deleteSuccess',
    defaultMessage: 'Milestone deleted.',
  },
  deleteFailure: {
    id: 'course.lessonPlan.LessonPlanShow.MilestoneAdminTools.deleteFailure',
    defaultMessage: 'Failed to delete milestone.',
  },
});

class MilestoneAdminTools extends PureComponent {
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

  showEditMilestoneDialog = () => {
    const {
      dispatch,
      intl,
      milestone: { title, description, start_at },
    } = this.props;

    return dispatch(
      actions.showMilestoneForm({
        onSubmit: this.updateMilestoneHandler,
        formTitle: intl.formatMessage(translations.editMilestone),
        initialValues: { title, description, start_at },
      }),
    );
  };

  updateMilestoneHandler = (data, setError) => {
    const {
      dispatch,
      intl,
      milestone: { id },
    } = this.props;

    const successMessage = intl.formatMessage(translations.updateSuccess);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(
      updateMilestone(id, data, successMessage, failureMessage, setError),
    );
  };

  render() {
    const { milestone, canManageLessonPlan } = this.props;
    if (!milestone.id || !canManageLessonPlan) {
      return null;
    }

    return (
      <span>
        <IconButton onClick={this.showEditMilestoneDialog}>
          <Edit />
        </IconButton>

        <IconButton color="error" onClick={this.deleteMilestoneHandler}>
          <Delete />
        </IconButton>
      </span>
    );
  }
}

MilestoneAdminTools.propTypes = {
  milestone: PropTypes.shape({
    id: PropTypes.number,
    description: PropTypes.string,
    start_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    title: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node, // Allow node containing translation
    ]),
  }),
  canManageLessonPlan: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default connect(({ lessonPlan }) => ({
  canManageLessonPlan: lessonPlan.flags.canManageLessonPlan,
}))(injectIntl(MilestoneAdminTools));
