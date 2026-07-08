import { FC } from 'react';
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  ListSubheader,
} from '@mui/material';

import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { selectDuplicationStore } from 'course/duplication/selectors';
import { DuplicationSurveyData } from 'course/duplication/types';
import componentTranslations from 'course/translations';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const renderRow = (survey: DuplicationSurveyData): JSX.Element => (
  <FormControlLabel
    key={`survey_${survey.id}`}
    className="flex items-center w-auto"
    control={<Checkbox checked />}
    label={
      <span className="flex items-center">
        <TypeBadge itemType="SURVEY" />
        <UnpublishedIcon tooltipId="itemUnpublished" />
        {survey.title}
      </span>
    }
  />
);

const DuplicationSurveyDataListing: FC = () => {
  const { surveyComponent, selectedItems } = useAppSelector(
    selectDuplicationStore,
  );
  const { t } = useTranslation();

  const selected = surveyComponent.filter((s) => selectedItems.SURVEY[s.id]);
  if (selected.length < 1) return null;

  return (
    <>
      <ListSubheader disableSticky>
        {t(componentTranslations.course_survey_component)}
      </ListSubheader>
      <Card>
        <CardContent>{selected.map(renderRow)}</CardContent>
      </Card>
    </>
  );
};

export default DuplicationSurveyDataListing;
