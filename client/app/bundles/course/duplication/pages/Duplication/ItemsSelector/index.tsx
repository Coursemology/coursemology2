import { itemSelectorPanels } from 'course/duplication/constants';
import { defineMessages } from 'react-intl';
import AssessmentsSelector from './AssessmentsSelector';
import SurveysSelector from './SurveysSelector';
import AchievementsSelector from './AchievementsSelector';
import MaterialsSelector from './MaterialsSelector';
import VideosSelector from './VideosSelector';
import { FC } from 'react';
import useTranslation from 'lib/hooks/useTranslation';
import { useAppSelector } from 'lib/hooks/store';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import destinationCourseSelector from 'course/duplication/selectors/destinationCourse';
import { Typography } from '@mui/material';

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
