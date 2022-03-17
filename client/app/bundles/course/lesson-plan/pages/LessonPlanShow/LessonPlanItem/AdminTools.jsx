/* eslint-disable camelcase */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';
import { Button } from '@material-ui/core';
import {
  showEventForm,
  updateEvent,
  deleteEvent,
  showDeleteConfirmation,
} from 'course/lesson-plan/actions';

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
    right: 66,
    position: 'absolute',
  },
  edit: {
    minWidth: 40,
  },
  delete: {
    minWidth: 40,
    marginLeft: 10,
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
      showEventForm({
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
        <Button
          variant="contained"
          onClick={this.showEditEventDialog}
          style={styles.edit}
        >
          <Edit />
        </Button>
        <Button
          variant="contained"
          onClick={this.deleteEventHandler}
          style={styles.delete}
        >
          <Delete />
        </Button>
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
    start_at: PropTypes.string,
    end_at: PropTypes.string,
    lesson_plan_item_type: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  canManageLessonPlan: PropTypes.bool.isRequired,

  dispatch: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default connect((state) => ({
  canManageLessonPlan: state.flags.canManageLessonPlan,
}))(injectIntl(AdminTools));
