import { FC } from 'react';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Survey } from 'course/duplication/types';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

interface RowProps {
  survey: Survey;
}

const SurveyRow: FC<RowProps> = (props) => {
  const { survey } = props;
  const dispatch = useAppDispatch();
  const duplication = useAppSelector(selectDuplicationStore);

  const { selectedItems } = duplication;
  const checked = !!selectedItems[duplicableItemTypes.SURVEY][survey.id];
  const label = (
    <span className="flex flex-row items-center">
      <TypeBadge itemType={duplicableItemTypes.SURVEY} />
      {survey.published || <UnpublishedIcon />}
      <Typography className="font-bold">{survey.title}</Typography>
    </span>
  );

  return (
    <IndentedCheckbox
      key={survey.id}
      checked={checked}
      indentLevel={0}
      label={label}
      onChange={(_, value) =>
        dispatch(
          actions.setItemSelectedBoolean(
            duplicableItemTypes.SURVEY,
            survey.id,
            value,
          ),
        )
      }
    />
  );
};

export default SurveyRow;
