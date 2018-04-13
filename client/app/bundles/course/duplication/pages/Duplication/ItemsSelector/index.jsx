import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { itemSelectorPanels } from 'course/duplication/constants';
import destinationCourseSelector from 'course/duplication/selectors/destinationCourse';
import { courseShape } from 'course/duplication/propTypes';
import AssessmentsSelector from './AssessmentsSelector';
import SurveysSelector from './SurveysSelector';
import AchievementsSelector from './AchievementsSelector';
import MaterialsSelector from './MaterialsSelector';
import VideosSelector from './VideosSelector';

const translations = defineMessages({
  pleaseSelectItems: {
    id: 'course.duplication.ItemsSelector.pleaseSelectItems',
    defaultMessage: 'Please select items to duplicate via the sidebar.',
  },
  componentDisabled: {
    id: 'course.duplication.ItemsSelector.componentDisabled',
    defaultMessage: 'This component is not enabled for the destination course.',
  },
});

const styles = {
  message: {
    marginTop: 25,
  },
};

class ItemsSelector extends React.Component {
  static propTypes = {
    currentPanel: PropTypes.string,
    destinationCourse: courseShape,
  }

  static panelComponentMap = {
    [itemSelectorPanels.ASSESSMENTS]: AssessmentsSelector,
    [itemSelectorPanels.SURVEYS]: SurveysSelector,
    [itemSelectorPanels.ACHIEVEMENTS]: AchievementsSelector,
    [itemSelectorPanels.MATERIALS]: MaterialsSelector,
    [itemSelectorPanels.VIDEOS]: VideosSelector,
  }

  render() {
    const { currentPanel, destinationCourse } = this.props;

    if (!currentPanel) {
      return (
        <div style={styles.message}>
          <FormattedMessage {...translations.pleaseSelectItems} />
        </div>
      );
    }

    if (!destinationCourse.enabledComponents.includes(currentPanel)) {
      return (
        <div style={styles.message}>
          <FormattedMessage {...translations.componentDisabled} />
        </div>
      );
    }

    const CurrentPanel = ItemsSelector.panelComponentMap[currentPanel];
    return <CurrentPanel />;
  }
}

export default connect(state => ({
  currentPanel: state.duplication.currentItemSelectorPanel,
  destinationCourse: destinationCourseSelector(state),
}))(ItemsSelector);
