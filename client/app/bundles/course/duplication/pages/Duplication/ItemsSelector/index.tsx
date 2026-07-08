import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import {
  selectDestinationCourse,
  selectDuplicationStore,
} from 'course/duplication/selectors';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

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

const PanelComponentMapper = {
  ASSESSMENTS: AssessmentsSelector,
  SURVEYS: SurveysSelector,
  ACHIEVEMENTS: AchievementsSelector,
  MATERIALS: MaterialsSelector,
  VIDEOS: VideosSelector,
};

const ItemsSelector: FC = () => {
  const { currentItemSelectorPanel: currentPanel } = useAppSelector(
    selectDuplicationStore,
  );
  const destinationCourse = useAppSelector(selectDestinationCourse);
  const { t } = useTranslation();

  if (!destinationCourse) {
    return null;
  }

  if (!currentPanel) {
    return (
      <Typography className="mt-5" variant="body2">
        {t(translations.pleaseSelectItems)}
      </Typography>
    );
  }

  if (!destinationCourse.enabledComponents.includes(currentPanel)) {
    return (
      <Typography className="mt-5" variant="body2">
        {t(translations.componentDisabled)}
      </Typography>
    );
  }

  const CurrentPanel = PanelComponentMapper[currentPanel];
  return <CurrentPanel />;
};

export default ItemsSelector;
