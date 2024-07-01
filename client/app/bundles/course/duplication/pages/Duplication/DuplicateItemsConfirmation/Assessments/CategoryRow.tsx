import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { Category } from 'course/duplication/types';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  defaultCategory: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.AssessmentsListing.defaultCategory',
    defaultMessage: 'Default Category',
  },
});

interface CategoryRowProps {
  category?: Category;
}

const CategoryRow: FC<CategoryRowProps> = (props) => {
  const { t } = useTranslation();
  const { category } = props;

  if (!category) {
    return (
      <IndentedCheckbox
        disabled
        indentLevel={0}
        label={
          <Typography className="font-bold">
            {t(translations.defaultCategory)}
          </Typography>
        }
      />
    );
  }

  return (
    <IndentedCheckbox
      checked
      indentLevel={0}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={duplicableItemTypes.CATEGORY} />
          <Typography className="font-bold">{category.title}</Typography>
        </span>
      }
    />
  );
};

export default CategoryRow;
