import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { itemSelectorPanels } from 'course/duplication/constants';
import { courseShape } from 'course/duplication/propTypes';
import destinationCourseSelector from 'course/duplication/selectors/destinationCourse';

import AchievementsSelector from './AchievementsSelector';
import AssessmentsSelector from './AssessmentsSelector';
import MaterialsSelector from './MaterialsSelector';
import SurveysSelector from './SurveysSelector';
import VideosSelector from './VideosSelector';

const translations = defineMessages({
  pleaseSelectItems: {
    id: 'course.duplication.Duplication.ItemsSelector.pleaseSelectItems',
    defaultMessage: 'Please select items to duplicate via the sidebar.',
  },
  componentDisabled: {
    id: 'course.duplication.Duplication.ItemsSelector.componentDisabled',
    defaultMessage: 'This component is not enabled for the destination course.',
  },
});

const styles = {
  message: {
    marginTop: 25,
  },
};

const ItemsSelector = (props) => {
  const { currentPanel, destinationCourse } = props;

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
};

ItemsSelector.panelComponentMap = {
  [itemSelectorPanels.ASSESSMENTS]: AssessmentsSelector,
  [itemSelectorPanels.SURVEYS]: SurveysSelector,
  [itemSelectorPanels.ACHIEVEMENTS]: AchievementsSelector,
  [itemSelectorPanels.MATERIALS]: MaterialsSelector,
  [itemSelectorPanels.VIDEOS]: VideosSelector,
};

ItemsSelector.propTypes = {
  currentPanel: PropTypes.string,
  destinationCourse: courseShape,
};

export default connect((state) => ({
  currentPanel: state.duplication.currentItemSelectorPanel,
  destinationCourse: destinationCourseSelector(state),
}))(ItemsSelector);
