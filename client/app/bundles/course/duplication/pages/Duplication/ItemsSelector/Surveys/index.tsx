import { FC } from 'react';
import { Typography } from '@mui/material';

import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import SurveyBody from './SurveyBody';

const SurveySelector: FC = () => {
  const { t } = useTranslation();
  const duplication = useAppSelector(selectDuplicationStore);
  const { surveyComponent: surveys } = duplication;

  if (!surveys) {
    return null;
  }

  return (
    <>
      <Typography className="mt-3 mb-1" variant="h6">
        {t(defaultComponentTitles.course_survey_component)}
      </Typography>
      <SurveyBody surveys={surveys} />
    </>
  );
};

export default SurveySelector;
