import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  ListSubheader,
  Typography,
} from '@mui/material';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { Survey } from 'course/duplication/types';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { FC } from 'react';

const { SURVEY } = duplicableItemTypes;

interface RowProps {
  survey: Survey;
}

const RowComponent: FC<RowProps> = (props) => {
  const { survey } = props;

  return (
    <FormControlLabel
      key={`survey_${survey.id}`}
      control={<Checkbox checked />}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={duplicableItemTypes.SURVEY} />
          <UnpublishedIcon tooltipId="itemUnpublished" />
          <Typography className="font-bold">{survey.title}</Typography>
        </span>
      }
      className="flex items-center w-auto"
    />
  );
};

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
            <RowComponent survey={survey} />
          ))}
        </CardContent>
      </Card>
    </>
  );
};

export default SurveyListing;
