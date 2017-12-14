import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { itemSelectorPanels } from 'course/duplication/constants';
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
});

const styles = {
  pleaseSelectItems: {
    marginTop: 25,
  },
};

class ItemsSelector extends React.Component {
  static propTypes = {
    currentPanel: PropTypes.string,
  }

  static panelComponentMap = {
    [itemSelectorPanels.ASSESSMENTS]: AssessmentsSelector,
    [itemSelectorPanels.SURVEYS]: SurveysSelector,
    [itemSelectorPanels.ACHIEVEMENTS]: AchievementsSelector,
    [itemSelectorPanels.MATERIALS]: MaterialsSelector,
    [itemSelectorPanels.VIDEOS]: VideosSelector,
  }

  render() {
    const { currentPanel } = this.props;

    if (!currentPanel) {
      return (
        <div style={styles.pleaseSelectItems}>
          <FormattedMessage {...translations.pleaseSelectItems} />
        </div>
      );
    }

    const CurrentPanel = ItemsSelector.panelComponentMap[currentPanel];
    return <CurrentPanel />;
  }
}

export default connect(({ duplication }) => ({
  currentPanel: duplication.currentItemSelectorPanel,
}))(ItemsSelector);
