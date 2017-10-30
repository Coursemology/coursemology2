import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import mirrorCreator from 'mirror-creator';

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

import { duplicableItemTypes } from 'course/duplication/constants';
import { fetchObjectsList } from 'course/duplication/actions';
import { defaultComponentTitles } from 'course/translations.intl';

import TargetCourseSelector from './TargetCourseSelector';
import AssessmentsSelector from './AssessmentsSelector';
import SurveysSelector from './SurveysSelector';
import AchievementsSelector from './AchievementsSelector';
import DuplicateButton from './DuplicateButton';

const { TAB, ASSESSMENT, CATEGORY, SURVEY, ACHIEVEMENT } = duplicableItemTypes;

const panels = mirrorCreator([
  'TARGET_COURSE',
  'ASSESSMENTS',
  'SURVEYS',
  'ACHIEVEMENTS',
]);

const translations = defineMessages({
  duplicateItems: {
    id: 'course.duplication.ObjectDuplication.duplicateItems',
    defaultMessage: 'Duplicate Items',
  },
  selectTargetCourse: {
    id: 'course.duplication.ObjectDuplication.selectTargetCourse',
    defaultMessage: 'Select Target Course',
  },
  targetCourse: {
    id: 'course.duplication.ObjectDuplication.targetCourse',
    defaultMessage: 'Target Course',
  },
  duplicableItemsHeader: {
    id: 'course.duplication.ObjectDuplication.duplicableItemsHeader',
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

class ObjectDuplication extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    selectedItems: PropTypes.shape(),
    targetCourseId: PropTypes.number,

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

  renderSidebar() {
    const { selectedItems, targetCourseId } = this.props;

    const counts = {};
    Object.keys(selectedItems).forEach((key) => {
      const idsHash = selectedItems[key];
      counts[key] = Object.keys(idsHash).reduce((count, id) => (idsHash[id] ? count + 1 : count), 0);
    });

    const assessmentsComponentCount = counts[TAB] + counts[ASSESSMENT] + counts[CATEGORY];

    return (
      <Paper>
        <List style={styles.sidebar}>
          <Subheader>
            <FormattedMessage {...translations.selectTargetCourse} />
          </Subheader>
          <ListItem
            leftAvatar={
              <Avatar
                style={styles.countAvatar}
                size={30}
                backgroundColor={targetCourseId ? cyan500 : red500}
              >
                { targetCourseId ? <Done color={grey50} /> : <Clear color={grey50} /> }
              </Avatar>
            }
            onClick={() => this.setState({ panel: panels.TARGET_COURSE })}
          >
            <FormattedMessage {...translations.targetCourse} />
          </ListItem>

          <Subheader>
            <FormattedMessage {...translations.duplicableItemsHeader} />
          </Subheader>
          {
            ObjectDuplication.renderSidebarItem(
              defaultComponentTitles.course_assessments_component,
              assessmentsComponentCount,
              () => this.setState({ panel: panels.ASSESSMENTS })
            )
          }
          {
            ObjectDuplication.renderSidebarItem(
              defaultComponentTitles.course_survey_component,
              counts[SURVEY],
              () => this.setState({ panel: panels.SURVEYS })
            )
          }
          {
            ObjectDuplication.renderSidebarItem(
              defaultComponentTitles.course_achievements_component,
              counts[ACHIEVEMENT],
              () => this.setState({ panel: panels.ACHIEVEMENTS })
            )
          }

          <ListItem disabled style={styles.duplicateButton}>
            <DuplicateButton />
          </ListItem>
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
        <TitleBar title={<FormattedMessage {...translations.duplicateItems} />} />
        { this.props.isLoading ? <LoadingIndicator /> : this.renderBody() }
      </div>
    );
  }
}

export default connect(({ objectDuplication }) => ({
  isLoading: objectDuplication.isLoading,
  selectedItems: objectDuplication.selectedItems,
  targetCourseId: objectDuplication.targetCourseId,
}))(ObjectDuplication);
