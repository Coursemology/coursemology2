import { PureComponent } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import DropDownMenu from 'material-ui/DropDownMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import { blue500 } from 'material-ui/styles/colors';
import MyLocation from 'material-ui/svg-icons/maps/my-location';
import PropTypes from 'prop-types';

import TypeBadge from 'course/duplication/components/TypeBadge';
import { courseListingShape } from 'course/duplication/propTypes';

const styles = {
  prompt: {
    marginTop: 25,
  },
  dropDown: {
    width: '100%',
    boxShadow: '3px 3px 2px 1px rgba(231, 231, 231, 1)',
    margin: '4px',
    borderRadius: '4px',
  },
  dropdownRow: {
    display: 'flex',
  },
};

const translations = defineMessages({
  currentCourse: {
    id: 'course.duplication.CourseDropdownMenu.currentCourse',
    defaultMessage: 'Select Current Course',
  },
});

class CourseDropdownMenu extends PureComponent {
  renderCourseMenuItem = (course) => {
    const { currentHost } = this.props;
    const title =
      currentHost === course.host ? (
        course.title
      ) : (
        <span>
          <TypeBadge text={course.host} />
          {course.title}
        </span>
      );

    return <MenuItem key={course.id} primaryText={title} value={course.id} />;
  };

  render() {
    const {
      prompt,
      courses,
      onChange,
      onHome,
      disabled,
      currentCourseId,
      selectedCourseId,
      dropDownMenuProps,
    } = this.props;
    return (
      <>
        <p style={styles.prompt}>{prompt}</p>
        <div style={styles.dropdownRow}>
          <DropDownMenu
            autoWidth={false}
            disabled={disabled}
            onChange={onChange}
            style={styles.dropDown}
            value={selectedCourseId}
            {...dropDownMenuProps}
          >
            {courses.map(this.renderCourseMenuItem)}
          </DropDownMenu>
          <IconButton
            onClick={onHome}
            tooltip={<FormattedMessage {...translations.currentCourse} />}
          >
            <MyLocation
              color={currentCourseId === selectedCourseId ? blue500 : null}
            />
          </IconButton>
        </div>
      </>
    );
  }
}

CourseDropdownMenu.propTypes = {
  prompt: PropTypes.string.isRequired,
  currentHost: PropTypes.string.isRequired,
  selectedCourseId: PropTypes.number,
  currentCourseId: PropTypes.number,
  courses: courseListingShape.isRequired,
  onChange: PropTypes.func.isRequired,
  onHome: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  dropDownMenuProps: PropTypes.object,
};

CourseDropdownMenu.defaultProps = {
  disabled: false,
};

export default CourseDropdownMenu;
