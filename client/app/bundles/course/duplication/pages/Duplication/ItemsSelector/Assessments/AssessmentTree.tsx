import { FC } from 'react';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Assessment } from 'course/duplication/types';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

interface AssessmentTreeProps {
  assessment: Assessment;
}

const AssessmentTree: FC<AssessmentTreeProps> = (props) => {
  const dispatch = useAppDispatch();
  const duplication = useAppSelector(selectDuplicationStore);
  const { selectedItems } = duplication;

  const { assessment } = props;
  const { id, title, published } = assessment;
  const checked = !!selectedItems[duplicableItemTypes.ASSESSMENT][id];

  const label = (
    <span className="flex flex-row items-center">
      <TypeBadge itemType={duplicableItemTypes.ASSESSMENT} />
      {published || <UnpublishedIcon />}
      <Typography className="font-bold">{title}</Typography>
    </span>
  );

  return (
    <IndentedCheckbox
      key={id}
      checked={checked}
      indentLevel={2}
      label={label}
      onChange={(_, value) =>
        dispatch(
          actions.setItemSelectedBoolean(
            duplicableItemTypes.ASSESSMENT,
            id,
            value,
          ),
        )
      }
    />
  );
};

export default AssessmentTree;
