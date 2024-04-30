import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  root: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.MaterialsListing.root',
    defaultMessage: 'Root Folder',
  },
});

const RootRow: FC = () => {
  const { t } = useTranslation();
  return (
    <IndentedCheckbox
      disabled
      indentLevel={0}
      label={
        <Typography className="font-bold">{t(translations.root)}</Typography>
      }
    />
  );
};

export default RootRow;
