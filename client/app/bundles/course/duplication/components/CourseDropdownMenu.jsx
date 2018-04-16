import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import { courseListingShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';

const styles = {
  prompt: {
    marginTop: 25,
  },
  dropDown: {
    width: '100%',
  },
};

class CourseDropdownMenu extends React.PureComponent {
  static propTypes = {
    prompt: PropTypes.string.isRequired,
    currentHost: PropTypes.string.isRequired,
    selectedCourseId: PropTypes.number,
    courses: courseListingShape.isRequired,
    onChange: PropTypes.func.isRequired,
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

  render() {
    const { prompt, selectedCourseId, courses, onChange } = this.props;
    return (
      <React.Fragment>
        <p style={styles.prompt}>{ prompt }</p>
        <DropDownMenu
          autoWidth={false}
          style={styles.dropDown}
          value={selectedCourseId}
          onChange={onChange}
        >
          { courses.map(this.renderCourseMenuItem) }
        </DropDownMenu>
      </React.Fragment>
    );
  }
}

export default CourseDropdownMenu;
