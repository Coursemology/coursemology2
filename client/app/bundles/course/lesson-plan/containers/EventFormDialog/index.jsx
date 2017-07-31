import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getFormValues, isPristine } from 'redux-form';
import FormDialogue from 'lib/components/FormDialogue';
import { formNames } from 'course/lesson-plan/constants';
import * as actionCreators from 'course/lesson-plan/actions';
import * as libActionCreators from 'lib/actions';
import EventForm from './EventForm';

const EventFormDialog = ({
  visible,
  disabled,
  formTitle,
  initialValues,
  onSubmit,
  pristine,
  dispatch,
  formValues,
  items,
}) => {
  const { hideEventForm, submitEventForm } = bindActionCreators(actionCreators, dispatch);
  const { shiftEndDate } = bindActionCreators(libActionCreators, dispatch);

  const { eventTypes, eventLocations } = items.reduce((values, item) => {
    if (!item.eventId) { return values; }
    if (item.location) { values.eventLocations.push(item.location); }
    values.eventTypes.push(item.lesson_plan_item_type[0]);
    return values;
  }, { eventTypes: [], eventLocations: [] });

  return (
    <FormDialogue
      title={formTitle}
      open={visible}
      submitForm={submitEventForm}
      skipConfirmation={pristine}
      disabled={disabled}
      hideForm={hideEventForm}
    >
      <EventForm
        {...{ initialValues, onSubmit, disabled, shiftEndDate, formValues }}
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
  visible: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  formTitle: PropTypes.string,
  initialValues: PropTypes.shape({
    id: PropTypes.number,
    eventId: PropTypes.number,
    title: PropTypes.string,
    event_type: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string,
    start_at: PropTypes.string,
    end_at: PropTypes.string,
    published: PropTypes.bool,
  }),
  items: PropTypes.arrayOf(PropTypes.shape({
    eventId: PropTypes.number,
    location: PropTypes.string,
    lesson_plan_item_type: PropTypes.arrayOf(PropTypes.string),
  })),
  formValues: PropTypes.shape(),
  onSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ eventForm, ...state }) => ({
  ...eventForm,
  items: state.lessonPlan.items,
  pristine: isPristine(formNames.EVENT)(state),
  formValues: getFormValues(formNames.EVENT)(state),
}))(EventFormDialog);
