import { FC } from 'react';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';

import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { Survey } from 'course/duplication/types';

interface RowProps {
  survey: Survey;
}

const SurveyRow: FC<RowProps> = (props) => {
  const { survey } = props;

  return (
    <FormControlLabel
      key={`survey_${survey.id}`}
      className="flex items-center w-auto"
      control={<Checkbox checked />}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={duplicableItemTypes.SURVEY} />
          <UnpublishedIcon tooltipId="itemUnpublished" />
          <Typography className="font-bold">{survey.title}</Typography>
        </span>
      }
    />
  );
};

export default SurveyRow;
