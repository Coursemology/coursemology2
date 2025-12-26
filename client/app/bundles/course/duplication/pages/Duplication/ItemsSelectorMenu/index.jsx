import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { cyan } from '@mui/material/colors';
import PropTypes from 'prop-types';

import {
  duplicableItemTypes,
  itemSelectorPanels as panels,
} from 'course/duplication/constants';
import { courseShape } from 'course/duplication/propTypes';
import { actions } from 'course/duplication/store';
import componentTranslations from 'course/translations';

import DuplicateButton from '../DuplicateButton';

const {
  TAB,
  ASSESSMENT,
  CATEGORY,
  SURVEY,
  ACHIEVEMENT,
  FOLDER,
  MATERIAL,
  VIDEO_TAB,
  VIDEO,
} = duplicableItemTypes;

const styles = {
  countAvatar: {
    height: '30px',
    width: '30px',
    margin: 5,
  },
  duplicateButton: {
    display: 'flex',
    justifyContent: 'center',
  },
};

class ItemsSelectorMenu extends Component {
  renderSidebarItem(panelKey, titleKey, count, className) {
    const { dispatch, enabledComponents } = this.props;
    if (!enabledComponents.includes(panelKey)) {
      return null;
    }
    if (enabledComponents.length === 1) {
      dispatch(actions.setItemSelectorPanel(panelKey));
    }

    return (
      <ListItem
        button
        className={className}
        onClick={() => dispatch(actions.setItemSelectorPanel(panelKey))}
      >
        <ListItemAvatar>
          <Avatar
            style={{
              ...styles.countAvatar,
              backgroundColor: count > 0 ? cyan[500] : null,
            }}
          >
            {count}
          </Avatar>
        </ListItemAvatar>
        <ListItemText>
          <FormattedMessage {...componentTranslations[titleKey]} />
        </ListItemText>
      </ListItem>
    );
  }

  render() {
    const { selectedItems, courses, destinationCourseId } = this.props;
    // Disabled models for cherry pick duplication as defined in `disabled_cherrypickable_types`.
    const unduplicableObjectTypes = courses.find(
      (course) => course.id === destinationCourseId,
    ).unduplicableObjectTypes;

    const counts = {};
    Object.keys(selectedItems).forEach((key) => {
      const idsHash = selectedItems[key];
      counts[key] = Object.keys(idsHash).reduce(
        (count, id) => (idsHash[id] ? count + 1 : count),
        0,
      );
    });

    const assessmentsComponentCount =
      counts[TAB] + counts[ASSESSMENT] + counts[CATEGORY];
    const videosComponentCount = counts[VIDEO] + counts[VIDEO_TAB];

    return (
      <List className="items-selector-menu">
        {unduplicableObjectTypes.includes('ASSESSMENT')
          ? null
          : this.renderSidebarItem(
              panels.ASSESSMENTS,
              'course_assessments_component',
              assessmentsComponentCount,
              'items-selector-menu-assessment',
            )}
        {unduplicableObjectTypes.includes('SURVEY')
          ? null
          : this.renderSidebarItem(
              panels.SURVEYS,
              'course_survey_component',
              counts[SURVEY],
              'items-selector-menu-survey',
            )}
        {unduplicableObjectTypes.includes('ACHIEVEMENT')
          ? null
          : this.renderSidebarItem(
              panels.ACHIEVEMENTS,
              'course_achievements_component',
              counts[ACHIEVEMENT],
              'items-selector-menu-achievement',
            )}
        {unduplicableObjectTypes.includes('MATERIAL')
          ? null
          : this.renderSidebarItem(
              panels.MATERIALS,
              'course_materials_component',
              counts[FOLDER] + counts[MATERIAL],
              'items-selector-menu-material',
            )}
        {unduplicableObjectTypes.includes('VIDEO')
          ? null
          : this.renderSidebarItem(
              panels.VIDEOS,
              'course_videos_component',
              videosComponentCount,
              'items-selector-menu-video',
            )}
        <ListItem style={styles.duplicateButton}>
          <DuplicateButton />
        </ListItem>
      </List>
    );
  }
}

ItemsSelectorMenu.propTypes = {
  selectedItems: PropTypes.shape({}),
  enabledComponents: PropTypes.arrayOf(PropTypes.string),
  destinationCourseId: PropTypes.number,
  courses: PropTypes.arrayOf(courseShape),
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ duplication }) => ({
  selectedItems: duplication.selectedItems,
  enabledComponents: duplication.sourceCourse.enabledComponents,
  destinationCourseId: duplication.destinationCourseId,
  courses: duplication.destinationCourses,
}))(ItemsSelectorMenu);
