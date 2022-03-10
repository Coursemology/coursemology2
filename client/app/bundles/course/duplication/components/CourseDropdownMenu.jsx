import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { IconButton, MenuItem, Select } from '@material-ui/core';
import { Tooltip } from '@mui/material';
import { blue } from '@mui/material/colors';
import MyLocation from '@mui/icons-material/MyLocation';
import { courseListingShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';

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

    return (
      <MenuItem key={course.id} value={course.id}>
        {title}
      </MenuItem>
    );
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
          <Select
            disabled={disabled}
            onChange={onChange}
            value={selectedCourseId || ''}
            style={styles.dropDown}
            {...dropDownMenuProps}
            variant="standard"
          >
            {courses.map(this.renderCourseMenuItem)}
          </Select>
          <Tooltip title={<FormattedMessage {...translations.currentCourse} />}>
            <IconButton onClick={onHome}>
              <MyLocation
                htmlColor={
                  currentCourseId === selectedCourseId ? blue[500] : null
                }
              />
            </IconButton>
          </Tooltip>
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
