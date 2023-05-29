/* eslint-disable camelcase */
import { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import PropTypes from 'prop-types';

import { showDeleteConfirmation } from 'lib/actions';

import { deleteEvent, updateEvent } from '../../../operations';
import { actions } from '../../../store';

const translations = defineMessages({
  editEvent: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminTools.editEvent',
    defaultMessage: 'Edit Event',
  },
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminTools.updateSuccess',
    defaultMessage: 'Event updated.',
  },
  updateFailure: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminTools.updateFailure',
    defaultMessage: 'Failed to update event.',
  },
  deleteSuccess: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminTools.deleteSuccess',
    defaultMessage: 'Event deleted.',
  },
  deleteFailure: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminTools.deleteFailure',
    defaultMessage: 'Failed to delete event.',
  },
});

const styles = {
  tools: {
    top: 16,
    right: 20,
    position: 'absolute',
  },
};

class AdminTools extends PureComponent {
  deleteEventHandler = () => {
    const {
      dispatch,
      intl,
      item: { id, eventId },
    } = this.props;
    const successMessage = intl.formatMessage(translations.deleteSuccess);
    const failureMessage = intl.formatMessage(translations.deleteFailure);
    const handleDelete = () =>
      dispatch(deleteEvent(id, eventId, successMessage, failureMessage));
    return dispatch(showDeleteConfirmation(handleDelete));
  };

  showEditEventDialog = () => {
    const { dispatch, intl, item } = this.props;
    const {
      title,
      lesson_plan_item_type,
      location,
      description,
      start_at,
      end_at,
      published,
    } = item;

    return dispatch(
      actions.showEventForm({
        onSubmit: this.updateEventHandler,
        formTitle: intl.formatMessage(translations.editEvent),
        initialValues: {
          title,
          location,
          description,
          start_at,
          end_at,
          published,
          event_type: lesson_plan_item_type[0],
        },
      }),
    );
  };

  updateEventHandler = (data) => {
    const {
      dispatch,
      intl,
      item: { eventId },
    } = this.props;
    const successMessage = intl.formatMessage(translations.updateSuccess);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(updateEvent(eventId, data, successMessage, failureMessage));
  };

  render() {
    const {
      item: { eventId },
      canManageLessonPlan,
    } = this.props;
    if (!canManageLessonPlan || eventId === undefined) {
      return null;
    }

    return (
      <span style={styles.tools}>
        <IconButton onClick={this.showEditEventDialog}>
          <Edit />
        </IconButton>

        <IconButton color="error" onClick={this.deleteEventHandler}>
          <Delete />
        </IconButton>
      </span>
    );
  }
}

AdminTools.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
    eventId: PropTypes.number,
    title: PropTypes.string,
    published: PropTypes.bool,
    location: PropTypes.string,
    description: PropTypes.string,
    start_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    end_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    lesson_plan_item_type: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  canManageLessonPlan: PropTypes.bool.isRequired,

  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default connect(({ lessonPlan }) => ({
  canManageLessonPlan: lessonPlan.flags.canManageLessonPlan,
}))(injectIntl(AdminTools));
