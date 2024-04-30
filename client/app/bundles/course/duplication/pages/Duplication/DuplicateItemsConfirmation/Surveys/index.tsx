import { FC } from 'react';
import { Card, CardContent, ListSubheader } from '@mui/material';

import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import SurveyRow from './SurveyRow';

const SurveyListing: FC = () => {
  const { t } = useTranslation();
  const duplication = useAppSelector(selectDuplicationStore);

  const { surveyComponent: surveys, selectedItems } = duplication;

  const selectedSurveys = surveys
    ? surveys.filter(
        (survey) => selectedItems[duplicableItemTypes.SURVEY][survey.id],
      )
    : [];

  if (selectedSurveys.length < 1) {
    return null;
  }

  return (
    <>
      <ListSubheader disableSticky>
        {t(defaultComponentTitles.course_survey_component)}
      </ListSubheader>
      <Card>
        <CardContent>
          {selectedSurveys.map((survey) => (
            <SurveyRow key={survey.id} survey={survey} />
          ))}
        </CardContent>
      </Card>
    </>
  );
};

export default SurveyListing;
