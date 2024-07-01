import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import { duplicationModes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicateAllButton from './DuplicateAllButton';
import ItemsSelectorMenu from './ItemsSelectorMenu';

const translations = defineMessages({
  items: {
    id: 'course.duplication.Duplication.items',
    defaultMessage: 'Selected Items',
  },
});

const ItemsSelectorSidebar: FC = () => {
  const { t } = useTranslation();

  const duplication = useAppSelector(selectDuplicationStore);
  const { destinationCourseId, duplicationMode } = duplication;

  const isCourseSelected = !!destinationCourseId;
  if (duplicationMode === duplicationModes.COURSE) {
    return <DuplicateAllButton />;
  }

  if (isCourseSelected) {
    return (
      <div>
        <Typography className="py-6 px-5 pt-0" variant="h6">
          {t(translations.items)}
        </Typography>
        <ItemsSelectorMenu />
      </div>
    );
  }

  return <div />;
};

export default ItemsSelectorSidebar;
