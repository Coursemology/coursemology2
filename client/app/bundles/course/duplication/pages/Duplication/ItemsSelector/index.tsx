import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import { itemSelectorPanels } from 'course/duplication/constants';
import destinationCourseSelector from 'course/duplication/selectors/destinationCourse';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import AchievementsSelector from './Achievements';
import AssessmentsSelector from './Assessments';
import MaterialsSelector from './Materials';
import SurveysSelector from './Surveys';
import VideosSelector from './Videos';

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

const PanelComponentMap = {
  [itemSelectorPanels.ASSESSMENTS]: AssessmentsSelector,
  [itemSelectorPanels.SURVEYS]: SurveysSelector,
  [itemSelectorPanels.ACHIEVEMENTS]: AchievementsSelector,
  [itemSelectorPanels.MATERIALS]: MaterialsSelector,
  [itemSelectorPanels.VIDEOS]: VideosSelector,
};

const ItemsSelector: FC = () => {
  const { t } = useTranslation();
  const duplication = useAppSelector(selectDuplicationStore);
  const { currentItemSelectorPanel: currentPanel } = duplication;

  const destinationCourse = useAppSelector(destinationCourseSelector);

  if (!currentPanel) {
    return (
      <div className="mt-6">
        <Typography variant="body2">
          {t(translations.pleaseSelectItems)}
        </Typography>
      </div>
    );
  }

  if (!destinationCourse.enabledComponents.includes(currentPanel)) {
    return (
      <div className="mt-6">
        <Typography variant="body2">
          {t(translations.componentDisabled)}
        </Typography>
      </div>
    );
  }

  const CurrentPanel = PanelComponentMap[currentPanel];
  return <CurrentPanel />;
};

export default ItemsSelector;
