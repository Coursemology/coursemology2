import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { isValid } from 'redux-form';

import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import { red500, cyan500, grey50 } from 'material-ui/styles/colors';
import Subheader from 'material-ui/Subheader';
import Clear from 'material-ui/svg-icons/content/clear';
import Done from 'material-ui/svg-icons/action/done';

import TitleBar from 'lib/components/TitleBar';
import LoadingIndicator from 'lib/components/LoadingIndicator';

import { duplicableItemTypes, formNames, itemSelectorPanels } from 'course/duplication/constants';
import { fetchObjectsList, setItemSelectorPanel } from 'course/duplication/actions';
import { defaultComponentTitles } from 'course/translations.intl';

import ItemsSelector from './ItemsSelector';
import DuplicateButton from './DuplicateButton';
import DuplicateAllButton from './DuplicateAllButton';

const { TAB, ASSESSMENT, CATEGORY, SURVEY, ACHIEVEMENT, FOLDER, MATERIAL, VIDEO } = duplicableItemTypes;

const translations = defineMessages({
  duplicateData: {
    id: 'course.duplication.Duplication.duplicateData',
    defaultMessage: 'Duplicate Data',
  },
  selectTargetCourse: {
    id: 'course.duplication.Duplication.selectTargetCourse',
    defaultMessage: 'Select Target Course',
  },
  targetCourse: {
    id: 'course.duplication.Duplication.targetCourse',
    defaultMessage: 'Target Course',
  },
  duplicableItemsHeader: {
    id: 'course.duplication.Duplication.duplicableItemsHeader',
    defaultMessage: 'Select Items to Duplicate',
  },
});

const styles = {
  body: {
    display: 'flex',
  },
  sidebar: {
    width: 250,
  },
  mainPanel: {
    paddingLeft: 40,
    paddingRight: 40,
    width: '100%',
  },
  countAvatar: {
    margin: 5,
  },
  duplicateButton: {
    display: 'flex',
    justifyContent: 'center',
  },
};

class Duplication extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    selectedItems: PropTypes.shape({}),
    isExistingCourseSelected: PropTypes.bool.isRequired,
    newCourseFormValid: PropTypes.bool.isRequired,
    duplicationMode: PropTypes.string.isRequired,

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

  componentDidMount() {
    this.props.dispatch(fetchObjectsList());
  }

  renderCourseSelector() {
    const { dispatch, isExistingCourseSelected, newCourseFormValid, duplicationMode } = this.props;
    const isCourseSelected =
      duplicationMode === 'course' ? newCourseFormValid : isExistingCourseSelected;

    return (
      <div>
        <Subheader>
          <FormattedMessage {...translations.selectTargetCourse} />
        </Subheader>
        <ListItem
          leftAvatar={
            <Avatar
              style={styles.countAvatar}
              size={30}
              backgroundColor={isCourseSelected ? cyan500 : red500}
            >
              { isCourseSelected ? <Done color={grey50} /> : <Clear color={grey50} /> }
            </Avatar>
          }
          onClick={() => dispatch(setItemSelectorPanel(itemSelectorPanels.TARGET_COURSE))}
        >
          <FormattedMessage {...translations.targetCourse} />
        </ListItem>
      </div>
    );
  }

  renderItemsSelector() {
    const { dispatch, selectedItems } = this.props;

    const counts = {};
    Object.keys(selectedItems).forEach((key) => {
      const idsHash = selectedItems[key];
      counts[key] = Object.keys(idsHash).reduce((count, id) => (idsHash[id] ? count + 1 : count), 0);
    });

    const assessmentsComponentCount = counts[TAB] + counts[ASSESSMENT] + counts[CATEGORY];

    return (
      <div>
        <Subheader>
          <FormattedMessage {...translations.duplicableItemsHeader} />
        </Subheader>
        {
          Duplication.renderSidebarItem(
            defaultComponentTitles.course_assessments_component,
            assessmentsComponentCount,
            () => dispatch(setItemSelectorPanel(itemSelectorPanels.ASSESSMENTS))
          )
        }
        {
          Duplication.renderSidebarItem(
            defaultComponentTitles.course_survey_component,
            counts[SURVEY],
            () => dispatch(setItemSelectorPanel(itemSelectorPanels.SURVEYS))
          )
        }
        {
          Duplication.renderSidebarItem(
            defaultComponentTitles.course_achievements_component,
            counts[ACHIEVEMENT],
            () => dispatch(setItemSelectorPanel(itemSelectorPanels.ACHIEVEMENTS))
          )
        }
        {
          Duplication.renderSidebarItem(
            defaultComponentTitles.course_materials_component,
            counts[FOLDER] + counts[MATERIAL],
            () => dispatch(setItemSelectorPanel(itemSelectorPanels.MATERIALS))
          )
        }
        {
          Duplication.renderSidebarItem(
            defaultComponentTitles.course_videos_component,
            counts[VIDEO],
            () => dispatch(setItemSelectorPanel(itemSelectorPanels.VIDEOS))
          )
        }
        <ListItem disabled style={styles.duplicateButton}>
          <DuplicateButton />
        </ListItem>
      </div>
    );
  }

  renderSidebar() {
    const { duplicationMode } = this.props;

    return (
      <Paper>
        <List style={styles.sidebar}>
          { this.renderCourseSelector() }
          {
            duplicationMode === 'course' ?
              <ListItem disabled style={styles.duplicateButton}>
                <DuplicateAllButton />
              </ListItem> :
            this.renderItemsSelector()
          }
        </List>
      </Paper>
    );
  }

  renderBody() {
    return (
      <div style={styles.body} >
        { this.renderSidebar() }
        <Paper style={styles.mainPanel}>
          <ItemsSelector />
        </Paper>
      </div>
    );
  }

  render() {
    return (
      <div>
        <TitleBar title={<FormattedMessage {...translations.duplicateData} />} />
        { this.props.isLoading ? <LoadingIndicator /> : this.renderBody() }
      </div>
    );
  }
}

export default connect(({ duplication, ...state }) => ({
  isLoading: duplication.isLoading,
  selectedItems: duplication.selectedItems,
  isExistingCourseSelected: !!duplication.targetCourseId,
  duplicationMode: duplication.duplicationMode,
  newCourseFormValid: isValid(formNames.NEW_COURSE)(state),
}))(Duplication);
