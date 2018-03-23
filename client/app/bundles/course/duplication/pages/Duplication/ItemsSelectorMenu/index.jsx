import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import { cyan500 } from 'material-ui/styles/colors';
import { duplicableItemTypes, itemSelectorPanels } from 'course/duplication/constants';
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
    dispatch: PropTypes.func.isRequired,
  }

  static renderSidebarItem(translation, count, onClick) {
    return (
      <ListItem
        leftAvatar={
          <Avatar
            style={styles.countAvatar}
            size={30}
            backgroundColor={count > 0 ? cyan500 : null}
          >
            { count }
          </Avatar>
        }
        onClick={onClick}
      >
        <FormattedMessage {...translation} />
      </ListItem>
    );
  }

  render() {
    const { dispatch, selectedItems } = this.props;

    const counts = {};
    Object.keys(selectedItems).forEach((key) => {
      const idsHash = selectedItems[key];
      counts[key] = Object.keys(idsHash).reduce((count, id) => (idsHash[id] ? count + 1 : count), 0);
    });

    const assessmentsComponentCount = counts[TAB] + counts[ASSESSMENT] + counts[CATEGORY];
    const videosComponentCount = counts[VIDEO] + counts[VIDEO_TAB];

    return (
      <List>
        {
          ItemsSelectorMenu.renderSidebarItem(
            defaultComponentTitles.course_assessments_component,
            assessmentsComponentCount,
            () => dispatch(setItemSelectorPanel(itemSelectorPanels.ASSESSMENTS))
          )
        }
        {
          ItemsSelectorMenu.renderSidebarItem(
            defaultComponentTitles.course_survey_component,
            counts[SURVEY],
            () => dispatch(setItemSelectorPanel(itemSelectorPanels.SURVEYS))
          )
        }
        {
          ItemsSelectorMenu.renderSidebarItem(
            defaultComponentTitles.course_achievements_component,
            counts[ACHIEVEMENT],
            () => dispatch(setItemSelectorPanel(itemSelectorPanels.ACHIEVEMENTS))
          )
        }
        {
          ItemsSelectorMenu.renderSidebarItem(
            defaultComponentTitles.course_materials_component,
            counts[FOLDER] + counts[MATERIAL],
            () => dispatch(setItemSelectorPanel(itemSelectorPanels.MATERIALS))
          )
        }
        {
          ItemsSelectorMenu.renderSidebarItem(
            defaultComponentTitles.course_videos_component,
            videosComponentCount,
            () => dispatch(setItemSelectorPanel(itemSelectorPanels.VIDEOS))
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
}))(ItemsSelectorMenu);
