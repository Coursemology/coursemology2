import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import CourseDropdownMenu from 'course/duplication/components/CourseDropdownMenu';
import { duplicationModes } from 'course/duplication/constants';
import { duplicateCourse } from 'course/duplication/operations';
import { courseShape, sourceCourseShape } from 'course/duplication/propTypes';
import { actions } from 'course/duplication/store';
import moment, { SHORT_DATE_TIME_FORMAT } from 'lib/moment';

import NewCourseForm from './NewCourseForm';

const translations = defineMessages({
  selectDestinationCoursePrompt: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.selectDestinationCoursePrompt',
    defaultMessage: 'Select destination course:',
  },
  defaultTitle: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.defaultTitle',
    defaultMessage: '{title} (Copied at {timestamp})',
  },
  success: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.success',
    defaultMessage: 'Duplication is successful. Redirecting to the new course.',
  },
  pending: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.pending',
    defaultMessage:
      'Please wait as your request to duplicate the course is being processed.\n\
    You may close the window while duplication is in progress and\n\
    you will also receive an email with a link to the new course when it becomes available.',
  },
  failure: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.failure',
    defaultMessage: 'Duplication failed.',
  },
});

class DestinationCourseSelector extends Component {
  renderExistingCourseForm = () => {
    const {
      currentHost,
      currentCourseId,
      courses,
      destinationCourseId,
      dispatch,
      intl,
    } = this.props;

    return (
      <CourseDropdownMenu
        courses={courses}
        currentCourseId={currentCourseId}
        currentHost={currentHost}
        dropDownMenuProps={{ className: 'destination-course-dropdown' }}
        onChange={(event) =>
          dispatch(actions.setDestinationCourseId(event.target.value))
        }
        onHome={() => dispatch(actions.setDestinationCourseId(currentCourseId))}
        prompt={intl.formatMessage(translations.selectDestinationCoursePrompt)}
        selectedCourseId={destinationCourseId}
      />
    );
  };

  renderNewCourseForm = () => {
    const {
      intl,
      dispatch,
      sourceCourse,
      currentInstanceId,
      destinationInstances,
      isDuplicating,
    } = this.props;

    const successMessage = intl.formatMessage(translations.success);
    const pendingMessage = intl.formatMessage(translations.pending);
    const failureMessage = intl.formatMessage(translations.failure);
    const tomorrow = moment().add(1, 'day');
    const defaultNewCourseStartAt = moment(sourceCourse.start_at).set({
      year: tomorrow.year(),
      month: tomorrow.month(),
      date: tomorrow.date(),
    });

    const timeNow = moment().format(SHORT_DATE_TIME_FORMAT);
    const newTitleValues = { title: sourceCourse.title, timestamp: timeNow };
    const initialValues = {
      destination_instance_id: currentInstanceId,
      new_title: intl.formatMessage(translations.defaultTitle, newTitleValues),
      new_start_at: defaultNewCourseStartAt,
    };

    return (
      <NewCourseForm
        disabled={isDuplicating}
        initialValues={initialValues}
        onSubmit={(values, setError) =>
          dispatch(
            duplicateCourse(
              values,
              destinationInstances[values.destination_instance_id]?.host,
              successMessage,
              pendingMessage,
              failureMessage,
              setError,
            ),
          )
        }
      />
    );
  };

  render() {
    const { duplicationMode } = this.props;

    return duplicationMode === duplicationModes.COURSE
      ? this.renderNewCourseForm()
      : this.renderExistingCourseForm();
  }
}

DestinationCourseSelector.propTypes = {
  currentHost: PropTypes.string,
  destinationCourseId: PropTypes.number,
  currentCourseId: PropTypes.number.isRequired,
  courses: PropTypes.arrayOf(courseShape),
  sourceCourse: sourceCourseShape,
  duplicationMode: PropTypes.string.isRequired,
  currentInstanceId: PropTypes.number.isRequired,
  destinationInstances: PropTypes.object,
  isDuplicating: PropTypes.bool.isRequired,

  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

export default connect(({ duplication }) => ({
  courses: duplication.destinationCourses,
  currentHost: duplication.currentHost,
  currentCourseId: duplication.currentCourseId,
  destinationCourseId: duplication.destinationCourseId,
  duplicationMode: duplication.duplicationMode,
  sourceCourse: duplication.sourceCourse,
  currentInstanceId: duplication.metadata.currentInstanceId,
  destinationInstances: duplication.destinationInstances,
  isDuplicating: duplication.isDuplicating,
}))(injectIntl(DestinationCourseSelector));
