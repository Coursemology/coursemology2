import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import { cyan500 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

import { setItemSelectorPanel } from 'course/duplication/actions';
import {
  duplicableItemTypes,
  itemSelectorPanels as panels,
} from 'course/duplication/constants';
import { courseShape } from 'course/duplication/propTypes';
import { defaultComponentTitles } from 'course/translations.intl';

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
    margin: 5,
  },
  duplicateButton: {
    display: 'flex',
    justifyContent: 'center',
  },
};

class ItemsSelectorMenu extends Component {
  renderSidebarItem(panelKey, titleKey, count) {
    const { dispatch, enabledComponents } = this.props;
    if (!enabledComponents.includes(panelKey)) {
      return null;
    }
    if (enabledComponents.length === 1) {
      dispatch(setItemSelectorPanel(panelKey));
    }

    return (
      <ListItem
        leftAvatar={
          <Avatar
            backgroundColor={count > 0 ? cyan500 : null}
            size={30}
            style={styles.countAvatar}
          >
            {count}
          </Avatar>
        }
        onClick={() => dispatch(setItemSelectorPanel(panelKey))}
      >
        <FormattedMessage {...defaultComponentTitles[titleKey]} />
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
            )}
        {unduplicableObjectTypes.includes('SURVEY')
          ? null
          : this.renderSidebarItem(
              panels.SURVEYS,
              'course_survey_component',
              counts[SURVEY],
            )}
        {unduplicableObjectTypes.includes('ACHIEVEMENT')
          ? null
          : this.renderSidebarItem(
              panels.ACHIEVEMENTS,
              'course_achievements_component',
              counts[ACHIEVEMENT],
            )}
        {unduplicableObjectTypes.includes('MATERIAL')
          ? null
          : this.renderSidebarItem(
              panels.MATERIALS,
              'course_materials_component',
              counts[FOLDER] + counts[MATERIAL],
            )}
        {unduplicableObjectTypes.includes('VIDEO')
          ? null
          : this.renderSidebarItem(
              panels.VIDEOS,
              'course_videos_component',
              videosComponentCount,
            )}
        <ListItem disabled={true} style={styles.duplicateButton}>
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
