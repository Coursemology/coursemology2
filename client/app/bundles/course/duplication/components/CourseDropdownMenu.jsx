import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import IconButton from 'material-ui/IconButton';
import MyLocation from 'material-ui/svg-icons/maps/my-location';
import { blue500 } from 'material-ui/styles/colors';
import { courseListingShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';

const styles = {
  prompt: {
    marginTop: 25,
  },
  dropDown: {
    width: '100%',
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

class CourseDropdownMenu extends React.PureComponent {
  static propTypes = {
    prompt: PropTypes.string.isRequired,
    currentHost: PropTypes.string.isRequired,
    selectedCourseId: PropTypes.number,
    currentCourseId: PropTypes.number,
    courses: courseListingShape.isRequired,
    onChange: PropTypes.func.isRequired,
    onHome: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    dropDownMenuProps: PropTypes.object,
  }

  static defaultProps = {
    disabled: false,
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
    const {
      prompt, courses, onChange, onHome, disabled,
      currentCourseId, selectedCourseId, dropDownMenuProps,
    } = this.props;
    return (
      <React.Fragment>
        <p style={styles.prompt}>{ prompt }</p>
        <div style={styles.dropdownRow}>
          <DropDownMenu
            autoWidth={false}
            style={styles.dropDown}
            value={selectedCourseId}
            onChange={onChange}
            disabled={disabled}
            {...dropDownMenuProps}
          >
            { courses.map(this.renderCourseMenuItem) }
          </DropDownMenu>
          <IconButton
            tooltip={<FormattedMessage {...translations.currentCourse} />}
            onClick={onHome}
          >
            <MyLocation color={currentCourseId === selectedCourseId ? blue500 : null} />
          </IconButton>
        </div>
      </React.Fragment>
    );
  }
}

export default CourseDropdownMenu;
