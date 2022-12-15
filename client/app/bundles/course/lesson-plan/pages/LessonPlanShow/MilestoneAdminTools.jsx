/* eslint-disable camelcase */
import { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import {
  deleteMilestone,
  showDeleteConfirmation,
  showMilestoneForm,
  updateMilestone,
} from 'course/lesson-plan/actions';

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

const styles = {
  edit: {
    minWidth: 40,
  },
  delete: {
    minWidth: 40,
    marginLeft: 10,
    marginRight: 20,
  },
};

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
      showMilestoneForm({
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
        <Button
          onClick={this.showEditMilestoneDialog}
          style={styles.edit}
          variant="outlined"
        >
          <Edit />
        </Button>
        <Button
          color="secondary"
          onClick={this.deleteMilestoneHandler}
          style={styles.delete}
          variant="outlined"
        >
          <Delete />
        </Button>
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

export default connect((state) => ({
  canManageLessonPlan: state.flags.canManageLessonPlan,
}))(injectIntl(MilestoneAdminTools));
