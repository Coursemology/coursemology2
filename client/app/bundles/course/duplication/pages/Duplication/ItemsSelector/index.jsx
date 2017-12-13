import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { itemSelectorPanels } from 'course/duplication/constants';
import TargetCourseSelector from '../TargetCourseSelector';
import AssessmentsSelector from './AssessmentsSelector';
import SurveysSelector from './SurveysSelector';
import AchievementsSelector from './AchievementsSelector';
import MaterialsSelector from './MaterialsSelector';
import VideosSelector from './VideosSelector';

class ItemsSelector extends React.Component {
  static propTypes = {
    currentPanel: PropTypes.string,
  }

  render() {
    const CurrentPanel = {
      [itemSelectorPanels.TARGET_COURSE]: TargetCourseSelector,
      [itemSelectorPanels.ASSESSMENTS]: AssessmentsSelector,
      [itemSelectorPanels.SURVEYS]: SurveysSelector,
      [itemSelectorPanels.ACHIEVEMENTS]: AchievementsSelector,
      [itemSelectorPanels.MATERIALS]: MaterialsSelector,
      [itemSelectorPanels.VIDEOS]: VideosSelector,
    }[this.props.currentPanel || itemSelectorPanels.TARGET_COURSE];

    return <CurrentPanel />;
  }
}

export default connect(({ duplication }) => ({
  currentPanel: duplication.currentItemSelectorPanel,
}))(ItemsSelector);
