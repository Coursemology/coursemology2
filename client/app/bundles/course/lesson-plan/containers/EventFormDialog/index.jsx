import { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import FormDialogue from 'lib/components/form/FormDialogue';

import { actions } from '../../store';

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
  const [isDirty, setIsDirty] = useState(false);

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
      disabled={disabled}
      form="event-form"
      hideForm={() => dispatch(actions.hideEventForm())}
      open={visible}
      skipConfirmation={!isDirty}
      title={formTitle}
    >
      <EventForm
        {...{ initialValues, onSubmit, disabled }}
        eventLocations={[...new Set(eventLocations)]}
        eventTypes={[...new Set(eventTypes)]}
        onDirtyChange={setIsDirty}
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

export default connect(({ lessonPlan }) => ({
  ...lessonPlan.eventForm,
  items: lessonPlan.lessonPlan.items,
}))(EventFormDialog);
