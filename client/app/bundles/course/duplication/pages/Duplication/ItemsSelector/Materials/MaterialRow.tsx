import { FC } from 'react';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Material } from 'course/duplication/types';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

interface MaterialRowProps {
  material: Material;
  indentLevel: number;
}

const MaterialRow: FC<MaterialRowProps> = (props) => {
  const { material, indentLevel } = props;
  const dispatch = useAppDispatch();

  const duplication = useAppSelector(selectDuplicationStore);
  const { selectedItems } = duplication;
  const checked = !!selectedItems[duplicableItemTypes.MATERIAL][material.id];

  return (
    <IndentedCheckbox
      key={material.id}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={duplicableItemTypes.MATERIAL} />
          <Typography className="font-bold">{material.name}</Typography>
        </span>
      }
      onChange={(_, value) =>
        dispatch(
          actions.setItemSelectedBoolean(
            duplicableItemTypes.MATERIAL,
            material.id,
            value,
          ),
        )
      }
      {...{ checked, indentLevel }}
    />
  );
};

export default MaterialRow;
