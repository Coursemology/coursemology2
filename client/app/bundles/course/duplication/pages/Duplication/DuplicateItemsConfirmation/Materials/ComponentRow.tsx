import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { Folder, Material } from 'course/duplication/types';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  nameConflictWarning: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.MaterialsListing.nameConflictWarning',
    defaultMessage:
      "Warning: Naming conflict exists. A serial number will be appended to the duplicated item's name.",
  },
});

interface RowProps {
  item: Material | Folder;
  itemType: typeof duplicableItemTypes;
  indentLevel: number;
  nameConflict: boolean;
}

const ComponentRow: FC<RowProps> = (props) => {
  const { t } = useTranslation();
  const { item, itemType, indentLevel, nameConflict } = props;

  return (
    <IndentedCheckbox
      key={`material_${item.id}`}
      checked
      indentLevel={indentLevel}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={itemType} />
          <Typography className="font-bold">{item.name}</Typography>
          {nameConflict && (
            <Typography variant="caption">
              {t(translations.nameConflictWarning)}
            </Typography>
          )}
        </span>
      }
    />
  );
};

export default ComponentRow;
