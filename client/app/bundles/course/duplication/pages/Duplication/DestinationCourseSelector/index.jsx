import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import moment, { shortDateTime } from 'lib/moment';
import {
  setDestinationCourseId,
  duplicateCourse,
} from 'course/duplication/actions';
import { duplicationModes } from 'course/duplication/constants';
import CourseDropdownMenu from 'course/duplication/components/CourseDropdownMenu';
import { courseShape, sourceCourseShape } from 'course/duplication/propTypes';
import NewCourseForm from './NewCourseForm';

const translations = defineMessages({
  selectDestinationCoursePrompt: {
    id: 'course.duplication.DestinationCourseSelector.selectDestinationCoursePrompt',
    defaultMessage: 'Select destination course:',
  },
  defaultTitle: {
    id: 'course.duplication.DestinationCourseSelector.defaultTitle',
    defaultMessage: '{title} (Copied at {timestamp})',
  },
  success: {
    id: 'course.duplication.DestinationCourseSelector.success',
    defaultMessage: 'Duplication is successful. Redirecting to the new course.',
  },
  pending: {
    id: 'course.duplication.DestinationCourseSelector.pending',
    defaultMessage:
      'Please wait as your request to duplicate the course is being processed.\n\
    You may close the window while duplication is in progress and \
    you will also receive an email with a link to the new course when it becomes available.',
  },
  failure: {
    id: 'course.duplication.DestinationCourseSelector.failure',
    defaultMessage: 'Duplication failed.',
  },
});

class DestinationCourseSelector extends React.Component {
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
        dropDownMenuProps={{ className: 'destination-course-dropdown' }}
        currentHost={currentHost}
        courses={courses}
        selectedCourseId={destinationCourseId}
        currentCourseId={currentCourseId}
        prompt={intl.formatMessage(translations.selectDestinationCoursePrompt)}
        onChange={(e, index, value) => dispatch(setDestinationCourseId(value))}
        onHome={() => dispatch(setDestinationCourseId(currentCourseId))}
      />
    );
  };

  renderNewCourseForm = () => {
    const { intl, dispatch, sourceCourse, isDuplicating } = this.props;

    const successMessage = intl.formatMessage(translations.success);
    const pendingMessage = intl.formatMessage(translations.pending);
    const failureMessage = intl.formatMessage(translations.failure);
    const tomorrow = moment().add(1, 'day');
    const defaultNewCourseStartAt = moment(sourceCourse.start_at).set({
      year: tomorrow.year(),
      month: tomorrow.month(),
      date: tomorrow.date(),
    });

    const timeNow = moment().format(shortDateTime);
    const newTitleValues = { title: sourceCourse.title, timestamp: timeNow };
    const initialValues = {
      new_title: intl.formatMessage(translations.defaultTitle, newTitleValues),
      new_start_at: defaultNewCourseStartAt,
    };

    return (
      <NewCourseForm
        onSubmit={(values) =>
          dispatch(
            duplicateCourse(
              values,
              successMessage,
              pendingMessage,
              failureMessage,
            ),
          )
        }
        disabled={isDuplicating}
        initialValues={initialValues}
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
  isDuplicating: PropTypes.bool.isRequired,

  dispatch: PropTypes.func.isRequired,
  intl: intlShape,
};

export default connect(({ duplication }) => ({
  courses: duplication.destinationCourses,
  currentHost: duplication.currentHost,
  currentCourseId: duplication.currentCourseId,
  destinationCourseId: duplication.destinationCourseId,
  duplicationMode: duplication.duplicationMode,
  sourceCourse: duplication.sourceCourse,
  isDuplicating: duplication.isDuplicating,
}))(injectIntl(DestinationCourseSelector));
