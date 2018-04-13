import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import moment, { shortDateTime } from 'lib/moment';
import { setDestinationCourseId, duplicateCourse } from 'course/duplication/actions';
import { duplicationModes } from 'course/duplication/constants';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { courseShape, currentCourseShape } from 'course/duplication/propTypes';
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
  failure: {
    id: 'course.duplication.DestinationCourseSelector.failure',
    defaultMessage: 'Duplication failed.',
  },
});

const styles = {
  dropDown: {
    width: '100%',
  },
  existingCourseForm: {
    marginTop: 25,
  },
};

class DestinationCourseSelector extends React.Component {
  static propTypes = {
    currentHost: PropTypes.string,
    destinationCourseId: PropTypes.number,
    courses: PropTypes.arrayOf(courseShape),
    currentCourse: currentCourseShape,
    duplicationMode: PropTypes.string.isRequired,
    isDuplicating: PropTypes.bool.isRequired,

    dispatch: PropTypes.func.isRequired,
    intl: intlShape,
  }

  renderCourseMenuItem = (course) => {
    const { currentHost } = this.props;
    const title = currentHost === course.host ? course.title : (
      <span>
        <TypeBadge text={course.host} />
        {course.title}
      </span>
    );

    return <MenuItem key={course.id} value={course.id} primaryText={title} />;
  }

  renderExistingCourseForm = () => {
    const { courses, destinationCourseId, dispatch } = this.props;

    return (
      <div style={styles.existingCourseForm}>
        <p><FormattedMessage {...translations.selectDestinationCoursePrompt} /></p>
        <DropDownMenu
          autoWidth={false}
          style={styles.dropDown}
          value={destinationCourseId}
          onChange={(e, index, value) => dispatch(setDestinationCourseId(value))}
        >
          { courses.map(this.renderCourseMenuItem) }
        </DropDownMenu>
      </div>
    );
  }

  renderNewCourseForm = () => {
    const { intl, dispatch, currentCourse, isDuplicating } = this.props;

    const failureMessage = intl.formatMessage(translations.failure);
    const tomorrow = moment().add(1, 'day');
    const defaultNewCourseStartAt = moment(currentCourse.start_at).set({
      year: tomorrow.year(),
      month: tomorrow.month(),
      date: tomorrow.date(),
    });

    const timeNow = moment().format(shortDateTime);
    const newTitleValues = { title: currentCourse.title, timestamp: timeNow };
    const initialValues = {
      new_title: intl.formatMessage(translations.defaultTitle, newTitleValues),
      new_start_at: defaultNewCourseStartAt,
    };

    return (
      <NewCourseForm
        onSubmit={values => dispatch(duplicateCourse(values, failureMessage))}
        disabled={isDuplicating}
        initialValues={initialValues}
      />
    );
  }

  render() {
    const { duplicationMode } = this.props;

    return duplicationMode === duplicationModes.COURSE ?
      this.renderNewCourseForm() :
      this.renderExistingCourseForm();
  }
}

export default connect(({ duplication }) => ({
  courses: duplication.destinationCourses,
  currentHost: duplication.currentHost,
  destinationCourseId: duplication.destinationCourseId,
  duplicationMode: duplication.duplicationMode,
  currentCourse: duplication.currentCourse,
  isDuplicating: duplication.isDuplicating,
}))(injectIntl(DestinationCourseSelector));
