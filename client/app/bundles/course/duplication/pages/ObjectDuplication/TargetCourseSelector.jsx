import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import { setTargetCourseId } from 'course/duplication/actions';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { courseShape } from 'course/duplication/propTypes';

const translations = defineMessages({
  targetCourse: {
    id: 'course.duplication.ObjectDuplication.targetCourse',
    defaultMessage: 'Target Course',
  },
  prompt: {
    id: 'course.duplication.ObjectDuplication.prompt',
    defaultMessage: 'Which course would you like to duplicate items to?',
  },
});

const styles = {
  dropDown: {
    width: '100%',
  },
};

class TargetCourseSelector extends React.Component {
  static propTypes = {
    currentHost: PropTypes.string,
    targetCourseId: PropTypes.number,
    courses: PropTypes.arrayOf(courseShape),

    dispatch: PropTypes.func.isRequired,
  }

  renderCourseMenuItem = (course) => {
    const { currentHost } = this.props;
    const title = currentHost === course.host ? course.title :
    (<span>
      <TypeBadge text={course.host} />
      {course.title}
    </span>);

    return <MenuItem key={course.id} value={course.id} primaryText={title} />;
  }

  render() {
    const { courses, targetCourseId, dispatch } = this.props;

    return (
      <div>
        <h2><FormattedMessage {...translations.targetCourse} /></h2>
        <p><FormattedMessage {...translations.prompt} /></p>
        <DropDownMenu
          autoWidth={false}
          style={styles.dropDown}
          value={targetCourseId}
          onChange={(e, index, value) => dispatch(setTargetCourseId(value))}
        >
          { courses.map(this.renderCourseMenuItem) }
        </DropDownMenu>
      </div>
    );
  }
}

export default connect(({ objectDuplication }) => ({
  courses: objectDuplication.targetCourses,
  currentHost: objectDuplication.currentHost,
  targetCourseId: objectDuplication.targetCourseId,
}))(TargetCourseSelector);
