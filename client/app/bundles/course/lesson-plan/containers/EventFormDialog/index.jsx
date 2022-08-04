import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FormDialogue from 'lib/components/FormDialogue';
import * as actionCreators from 'course/lesson-plan/actions';
import EventForm from './EventForm';

const EventFormDialog = ({
  visible,
  disabled,
  formTitle,
  initialValues,
  onSubmit,
  dispatch,
  items,
}) => {
  const { hideEventForm } = bindActionCreators(actionCreators, dispatch);

  const { eventTypes, eventLocations } = items.reduce(
    (values, item) => {
      if (!item.eventId) {
        return values;
      }
      if (item.location) {
        values.eventLocations.push(item.location);
      }
      values.eventTypes.push(item.lesson_plan_item_type[0]);
      return values;
    },
    { eventTypes: [], eventLocations: [] },
  );

  return (
    <FormDialogue
      title={formTitle}
      open={visible}
      skipConfirmation={false}
      disabled={disabled}
      form="event-form"
      hideForm={hideEventForm}
    >
      <EventForm
        {...{ initialValues, onSubmit, disabled }}
        eventTypes={[...new Set(eventTypes)]}
        eventLocations={[...new Set(eventLocations)]}
      />
    </FormDialogue>
  );
};

EventFormDialog.defaultProps = {
  visible: false,
  disabled: false,
};

EventFormDialog.propTypes = {
  visible: PropTypes.bool,
  disabled: PropTypes.bool,
  formTitle: PropTypes.string,
  initialValues: PropTypes.shape({
    id: PropTypes.number,
    eventId: PropTypes.number,
    title: PropTypes.string,
    event_type: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string,
    start_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    end_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    published: PropTypes.bool,
  }),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      eventId: PropTypes.number,
      location: PropTypes.string,
      lesson_plan_item_type: PropTypes.arrayOf(PropTypes.string),
    }),
  ),
  onSubmit: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ eventForm, ...state }) => ({
  ...eventForm,
  items: state.lessonPlan.items,
}))(EventFormDialog);
