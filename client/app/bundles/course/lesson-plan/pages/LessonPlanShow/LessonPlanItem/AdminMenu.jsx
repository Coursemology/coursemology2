import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { showEventForm, updateEvent, deleteEvent, showDeleteConfirmation } from 'course/lesson-plan/actions';

const translations = defineMessages({
  deleteItemConfirmation: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminMenu.deleteConfirmation',
    defaultMessage: 'Delete Lesson Plan Item?',
  },
  editEvent: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminMenu.editEvent',
    defaultMessage: 'Edit Event',
  },
  deleteEvent: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminMenu.deleteEvent',
    defaultMessage: 'Delete Event',
  },
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminMenu.updateSuccess',
    defaultMessage: 'Event updated.',
  },
  updateFailure: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminMenu.updateFailure',
    defaultMessage: 'Failed to update event.',
  },
  deleteSuccess: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminMenu.deleteSuccess',
    defaultMessage: 'Event deleted.',
  },
  deleteFailure: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminMenu.deleteFailure',
    defaultMessage: 'Failed to delete event.',
  },
});

const styles = {
  adminMenu: {
    top: 4,
    right: 4,
    position: 'absolute',
  },
};

class AdminMenu extends React.PureComponent {
  static propTypes = {
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
  }

  updateEventHandler = (data) => {
    const { dispatch, intl, item: { eventId } } = this.props;
    const successMessage = intl.formatMessage(translations.updateSuccess);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(updateEvent(eventId, data, successMessage, failureMessage));
  }

  showEditEventDialog = () => {
    const { dispatch, intl, item } = this.props;
    const { title, lesson_plan_item_type, location, description, start_at, end_at, published } = item;

    return dispatch(showEventForm({
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
    }));
  }

  deleteEventHandler = () => {
    const { dispatch, intl, item: { id, eventId } } = this.props;
    const successMessage = intl.formatMessage(translations.deleteSuccess);
    const failureMessage = intl.formatMessage(translations.deleteFailure);
    const handleDelete = () => (
      dispatch(deleteEvent(id, eventId, successMessage, failureMessage))
    );
    return dispatch(showDeleteConfirmation(handleDelete));
  }

  render() {
    const { intl, item: { eventId }, canManageLessonPlan } = this.props;
    if (!canManageLessonPlan || eventId === undefined) { return null; }

    return (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        style={styles.adminMenu}
      >
        <MenuItem
          primaryText={intl.formatMessage(translations.editEvent)}
          onTouchTap={this.showEditEventDialog}
        />
        <MenuItem
          primaryText={intl.formatMessage(translations.deleteEvent)}
          onTouchTap={this.deleteEventHandler}
        />
      </IconMenu>
    );
  }
}

export default connect(state => ({
  canManageLessonPlan: state.flags.canManageLessonPlan,
}))(injectIntl(AdminMenu));
