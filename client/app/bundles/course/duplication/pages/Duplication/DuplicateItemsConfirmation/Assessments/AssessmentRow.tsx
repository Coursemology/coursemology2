import { FC } from 'react';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { Assessment } from 'course/duplication/types';

interface AssessmentRowProps {
  assessment: Assessment;
}

const AssessmentRow: FC<AssessmentRowProps> = (props) => {
  const { assessment } = props;

  return (
    <IndentedCheckbox
      key={`assessment_${assessment.id}`}
      checked
      indentLevel={2}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={duplicableItemTypes.ASSESSMENT} />
          <UnpublishedIcon tooltipId="itemUnpublished" />
          <Typography className="font-bold">{assessment.title}</Typography>
        </span>
      }
    />
  );
};

export default AssessmentRow;
