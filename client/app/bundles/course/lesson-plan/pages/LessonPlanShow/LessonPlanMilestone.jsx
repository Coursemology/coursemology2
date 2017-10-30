import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import moment, { longDate } from 'lib/moment';
import {
  showMilestoneForm,
  updateMilestone,
  deleteMilestone,
  showDeleteConfirmation,
} from 'course/lesson-plan/actions';

const translations = defineMessages({
  editMilestone: {
    id: 'course.lessonPlan.LessonPlanMilestone.editMilestone',
    defaultMessage: 'Edit Milestone',
  },
  deleteMilestone: {
    id: 'course.lessonPlan.LessonPlanMilestone.deleteMilestone',
    defaultMessage: 'Delete Milestone',
  },
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanMilestone.updateSuccess',
    defaultMessage: 'Milestone updated.',
  },
  updateFailure: {
    id: 'course.lessonPlan.LessonPlanMilestone.updateFailure',
    defaultMessage: 'Failed to update milestone.',
  },
  deleteSuccess: {
    id: 'course.lessonPlan.LessonPlanMilestone.deleteSuccess',
    defaultMessage: 'Milestone deleted.',
  },
  deleteFailure: {
    id: 'course.lessonPlan.LessonPlanMilestone.deleteFailure',
    defaultMessage: 'Failed to delete milestone.',
  },
});

const styles = {
  titleRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  descriptionRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  description: {
    marginBottom: 12,
  },
};

class LessonPlanMilestone extends React.PureComponent {
  static propTypes = {
    id: PropTypes.number,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    startAt: PropTypes.string.isRequired,
    canManageLessonPlan: PropTypes.bool.isRequired,

    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  }

  updateMilestoneHandler = (data) => {
    const { dispatch, intl, id } = this.props;

    const successMessage = intl.formatMessage(translations.updateSuccess);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(updateMilestone(id, data, successMessage, failureMessage));
  }

  showEditMilestoneDialog = () => {
    const { dispatch, intl, title, description, startAt } = this.props;

    return dispatch(showMilestoneForm({
      onSubmit: this.updateMilestoneHandler,
      formTitle: intl.formatMessage(translations.editMilestone),
      initialValues: { title, description, start_at: startAt },
    }));
  }

  deleteMilestoneHandler = () => {
    const { dispatch, intl, id } = this.props;
    const successMessage = intl.formatMessage(translations.deleteSuccess);
    const failureMessage = intl.formatMessage(translations.deleteFailure);
    const handleDelete = () => (
      dispatch(deleteMilestone(id, successMessage, failureMessage))
    );
    return dispatch(showDeleteConfirmation(handleDelete));
  }

  renderAdminMenu() {
    const { intl, id, canManageLessonPlan } = this.props;
    if (!canManageLessonPlan || id === undefined) { return null; }

    return (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem
          primaryText={intl.formatMessage(translations.editMilestone)}
          onClick={this.showEditMilestoneDialog}
        />
        <MenuItem
          primaryText={intl.formatMessage(translations.deleteMilestone)}
          onClick={this.deleteMilestoneHandler}
        />
      </IconMenu>
    );
  }

  render() {
    const { id, title, description, startAt } = this.props;
    return (
      <div id={`milestone-${id}`}>
        <div style={styles.titleRow}>
          <h3>{ title }</h3>
          <p>{ moment(startAt).format(longDate) }</p>
        </div>
        <div style={styles.descriptionRow}>
          <span
            dangerouslySetInnerHTML={{ __html: description }}
            style={styles.description}
          />
          { this.renderAdminMenu() }
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  canManageLessonPlan: state.flags.canManageLessonPlan,
}))(injectIntl(LessonPlanMilestone));
