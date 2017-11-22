import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card, CardText } from 'material-ui/Card';

import moment, { shortDateTime } from 'lib/moment';
import { setTargetCourseId, setDuplicationMode, duplicateCourse } from 'course/duplication/actions';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { courseShape, currentCourseShape } from 'course/duplication/propTypes';
import { formNames } from 'course/duplication/constants';
import NewCourseForm from './NewCourseForm';

const translations = defineMessages({
  targetCourse: {
    id: 'course.duplication.ObjectDuplication.targetCourse',
    defaultMessage: 'Target Course',
  },
  existingCourse: {
    id: 'course.duplication.ObjectDuplication.existingCourse',
    defaultMessage: 'Existing Course',
  },
  newCourse: {
    id: 'course.duplication.ObjectDuplication.newCourse',
    defaultMessage: 'New Course',
  },
  newCoursePrompt: {
    id: 'course.duplication.ObjectDuplication.newCoursePrompt',
    defaultMessage: 'Enter details for the new course:',
  },
  prompt: {
    id: 'course.duplication.ObjectDuplication.prompt',
    defaultMessage: 'Which course would you like to duplicate to?',
  },
  selectExistingCoursePrompt: {
    id: 'course.duplication.ObjectDuplication.selectExistingCoursePrompt',
    defaultMessage: 'Select an existing course:',
  },
  defaultTitle: {
    id: 'course.duplication.ObjectDuplication.defaultTitle',
    defaultMessage: '{title} (Copied at {timestamp})',
  },
  failure: {
    id: 'course.duplication.ObjectDuplication.failure',
    defaultMessage: 'Duplication failed.',
  },
  timeshiftInfo: {
    id: 'course.duplication.ObjectDuplication.timeshiftInfo',
    defaultMessage: 'The current course starts at {timestamp}. \
      Duplicated items dates will be shifted by about {timeshift}.',
  },
});

const styles = {
  dropDown: {
    width: '100%',
  },
  card: {
    marginBottom: 20,
  },
};

class TargetCourseSelector extends React.Component {
  static propTypes = {
    currentHost: PropTypes.string,
    targetCourseId: PropTypes.number,
    courses: PropTypes.arrayOf(courseShape),
    currentCourse: currentCourseShape,
    duplicationMode: PropTypes.string.isRequired,
    isDuplicating: PropTypes.bool.isRequired,
    formValues: PropTypes.shape({
      new_start_at: PropTypes.oneOfType([
        PropTypes.instanceOf(Date),
        PropTypes.instanceOf(moment),
      ]),
    }),

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

  renderExistingCourseTab = () => {
    const { courses, targetCourseId, dispatch } = this.props;

    return (
      <Tab
        value="object"
        label={<FormattedMessage {...translations.existingCourse} />}
      >
        <Card style={styles.card}>
          <CardText>
            <p><FormattedMessage {...translations.selectExistingCoursePrompt} /></p>
            <DropDownMenu
              autoWidth={false}
              style={styles.dropDown}
              value={targetCourseId}
              onChange={(e, index, value) => dispatch(setTargetCourseId(value))}
            >
              { courses.map(this.renderCourseMenuItem) }
            </DropDownMenu>
          </CardText>
        </Card>
      </Tab>
    );
  }

  renderNewCourseTab = () => {
    const { intl, dispatch, currentCourse, isDuplicating, formValues } = this.props;

    const failureMessage = intl.formatMessage(translations.failure);
    const currentCourseStartAt = moment(currentCourse.start_at);
    const tomorrow = moment().add(1, 'day');
    const defaultNewCourseStartAt = moment(currentCourseStartAt).set({
      year: tomorrow.year(),
      month: tomorrow.month(),
      date: tomorrow.date(),
    });
    const newCourseStartAt = moment(formValues && formValues.new_start_at);

    const timeNow = moment().format(shortDateTime);
    const newTitleValues = { title: currentCourse.title, timestamp: timeNow };
    const initialValues = {
      new_title: intl.formatMessage(translations.defaultTitle, newTitleValues),
      new_start_at: defaultNewCourseStartAt,
    };

    return (
      <Tab
        value="course"
        label={<FormattedMessage {...translations.newCourse} />}
      >
        <Card style={styles.card}>
          <CardText>
            <FormattedMessage {...translations.newCoursePrompt} />
            <NewCourseForm
              onSubmit={values => dispatch(duplicateCourse(values, failureMessage))}
              disabled={isDuplicating}
              initialValues={initialValues}
            />
            <br />
            <FormattedMessage
              {...translations.timeshiftInfo}
              values={{
                timestamp: currentCourseStartAt.format(shortDateTime),
                timeshift: moment.duration(newCourseStartAt.diff(currentCourseStartAt)).humanize(),
              }}
            />
          </CardText>
        </Card>
      </Tab>
    );
  }

  render() {
    const { dispatch, duplicationMode } = this.props;

    return (
      <div>
        <h2><FormattedMessage {...translations.targetCourse} /></h2>
        <p><FormattedMessage {...translations.prompt} /></p>
        <Tabs
          value={duplicationMode}
          onChange={mode => dispatch(setDuplicationMode(mode))}
        >
          { this.renderNewCourseTab() }
          { this.renderExistingCourseTab() }
        </Tabs>
      </div>
    );
  }
}

export default connect(({ duplication, ...state }) => ({
  courses: duplication.targetCourses,
  currentHost: duplication.currentHost,
  targetCourseId: duplication.targetCourseId,
  duplicationMode: duplication.duplicationMode,
  currentCourse: duplication.currentCourse,
  isDuplicating: duplication.isDuplicating,
  formValues: getFormValues(formNames.NEW_COURSE)(state),
}))(injectIntl(TargetCourseSelector));
