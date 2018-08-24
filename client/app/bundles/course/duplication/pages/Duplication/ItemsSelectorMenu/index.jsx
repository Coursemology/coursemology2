import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import { cyan500 } from 'material-ui/styles/colors';
import { duplicableItemTypes, itemSelectorPanels as panels } from 'course/duplication/constants';
import { setItemSelectorPanel } from 'course/duplication/actions';
import { defaultComponentTitles } from 'course/translations.intl';
import DuplicateButton from '../DuplicateButton';

const { TAB, ASSESSMENT, CATEGORY, SURVEY, ACHIEVEMENT, FOLDER, MATERIAL, VIDEO_TAB, VIDEO } = duplicableItemTypes;

const styles = {
  countAvatar: {
    margin: 5,
  },
  duplicateButton: {
    display: 'flex',
    justifyContent: 'center',
  },
};

class ItemsSelectorMenu extends React.Component {
  static propTypes = {
    selectedItems: PropTypes.shape({}),
    enabledComponents: PropTypes.arrayOf(PropTypes.string),
    dispatch: PropTypes.func.isRequired,
  }

  renderSidebarItem(panelKey, titleKey, count) {
    const { dispatch, enabledComponents } = this.props;
    if (!enabledComponents.includes(panelKey)) { return null; }
    if (enabledComponents.length === 1) {
      dispatch(setItemSelectorPanel(panelKey));
    }

    return (
      <ListItem
        leftAvatar={(
          <Avatar
            style={styles.countAvatar}
            size={30}
            backgroundColor={count > 0 ? cyan500 : null}
          >
            { count }
          </Avatar>
)}
        onClick={() => dispatch(setItemSelectorPanel(panelKey))}
      >
        <FormattedMessage {...defaultComponentTitles[titleKey]} />
      </ListItem>
    );
  }

  render() {
    const { selectedItems } = this.props;

    const counts = {};
    Object.keys(selectedItems).forEach((key) => {
      const idsHash = selectedItems[key];
      counts[key] = Object.keys(idsHash).reduce((count, id) => (idsHash[id] ? count + 1 : count), 0);
    });

    const assessmentsComponentCount = counts[TAB] + counts[ASSESSMENT] + counts[CATEGORY];
    const videosComponentCount = counts[VIDEO] + counts[VIDEO_TAB];

    return (
      <List className="items-selector-menu">
        {
          this.renderSidebarItem(
            panels.ASSESSMENTS, 'course_assessments_component', assessmentsComponentCount
          )
        }
        {
          this.renderSidebarItem(
            panels.SURVEYS, 'course_survey_component', counts[SURVEY]
          )
        }
        {
          this.renderSidebarItem(
            panels.ACHIEVEMENTS, 'course_achievements_component', counts[ACHIEVEMENT]
          )
        }
        {
          this.renderSidebarItem(
            panels.MATERIALS, 'course_materials_component', counts[FOLDER] + counts[MATERIAL]
          )
        }
        {
          this.renderSidebarItem(
            panels.VIDEOS, 'course_videos_component', videosComponentCount
          )
        }
        <ListItem disabled style={styles.duplicateButton}>
          <DuplicateButton />
        </ListItem>
      </List>
    );
  }
}

export default connect(({ duplication }) => ({
  selectedItems: duplication.selectedItems,
  enabledComponents: duplication.sourceCourse.enabledComponents,
}))(ItemsSelectorMenu);
