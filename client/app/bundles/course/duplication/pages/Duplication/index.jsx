import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import mirrorCreator from 'mirror-creator';
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

import { duplicableItemTypes, formNames } from 'course/duplication/constants';
import { fetchObjectsList } from 'course/duplication/actions';
import { defaultComponentTitles } from 'course/translations.intl';

import TargetCourseSelector from './TargetCourseSelector';
import AssessmentsSelector from './AssessmentsSelector';
import SurveysSelector from './SurveysSelector';
import AchievementsSelector from './AchievementsSelector';
import MaterialsSelector from './MaterialsSelector';
import VideosSelector from './VideosSelector';
import DuplicateButton from './DuplicateButton';
import DuplicateAllButton from './DuplicateAllButton';

const { TAB, ASSESSMENT, CATEGORY, SURVEY, ACHIEVEMENT, FOLDER, MATERIAL, VIDEO } = duplicableItemTypes;

const panels = mirrorCreator([
  'TARGET_COURSE',
  'ASSESSMENTS',
  'SURVEYS',
  'ACHIEVEMENTS',
  'MATERIALS',
  'VIDEOS',
]);

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

  constructor(props) {
    super(props);

    this.state = {
      panel: panels.TARGET_COURSE,
    };
  }

  componentDidMount() {
    this.props.dispatch(fetchObjectsList());
  }

  renderCourseSelector() {
    const { isExistingCourseSelected, newCourseFormValid, duplicationMode } = this.props;
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
          onClick={() => this.setState({ panel: panels.TARGET_COURSE })}
        >
          <FormattedMessage {...translations.targetCourse} />
        </ListItem>
      </div>
    );
  }

  renderItemsSelector() {
    const { selectedItems } = this.props;

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
            () => this.setState({ panel: panels.ASSESSMENTS })
          )
        }
        {
          Duplication.renderSidebarItem(
            defaultComponentTitles.course_survey_component,
            counts[SURVEY],
            () => this.setState({ panel: panels.SURVEYS })
          )
        }
        {
          Duplication.renderSidebarItem(
            defaultComponentTitles.course_achievements_component,
            counts[ACHIEVEMENT],
            () => this.setState({ panel: panels.ACHIEVEMENTS })
          )
        }
        {
          Duplication.renderSidebarItem(
            defaultComponentTitles.course_materials_component,
            counts[FOLDER] + counts[MATERIAL],
            () => this.setState({ panel: panels.MATERIALS })
          )
        }
        {
          Duplication.renderSidebarItem(
            defaultComponentTitles.course_videos_component,
            counts[VIDEO],
            () => this.setState({ panel: panels.VIDEOS })
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

  renderMainPanel() {
    const CurrentPanel = {
      [panels.TARGET_COURSE]: TargetCourseSelector,
      [panels.ASSESSMENTS]: AssessmentsSelector,
      [panels.SURVEYS]: SurveysSelector,
      [panels.ACHIEVEMENTS]: AchievementsSelector,
      [panels.MATERIALS]: MaterialsSelector,
      [panels.VIDEOS]: VideosSelector,
    }[this.state.panel];

    return (
      <Paper style={styles.mainPanel}>
        <CurrentPanel />
      </Paper>
    );
  }

  renderBody() {
    return (
      <div style={styles.body} >
        { this.renderSidebar() }
        { this.renderMainPanel() }
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
