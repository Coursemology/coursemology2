import { FC } from 'react';
import { defineMessages, MessageDescriptor } from 'react-intl';
import { Typography } from '@mui/material';

import { DuplicableItemType } from 'course/duplication/types';
import useTranslation from 'lib/hooks/useTranslation';

const translations: Record<DuplicableItemType, MessageDescriptor> =
  defineMessages({
    ASSESSMENT: {
      id: 'course.duplication.TypeBadge.assessment',
      defaultMessage: 'Assessment',
    },
    CATEGORY: {
      id: 'course.duplication.TypeBadge.category',
      defaultMessage: 'Category',
    },
    TAB: {
      id: 'course.duplication.TypeBadge.tab',
      defaultMessage: 'Tab',
    },
    SURVEY: {
      id: 'course.duplication.TypeBadge.survey',
      defaultMessage: 'Survey',
    },
    ACHIEVEMENT: {
      id: 'course.duplication.TypeBadge.achievement',
      defaultMessage: 'Achievement',
    },
    FOLDER: {
      id: 'course.duplication.TypeBadge.folder',
      defaultMessage: 'Folder',
    },
    MATERIAL: {
      id: 'course.duplication.TypeBadge.material',
      defaultMessage: 'Material',
    },
    VIDEO: {
      id: 'course.duplication.TypeBadge.video',
      defaultMessage: 'Video',
    },
    VIDEO_TAB: {
      id: 'course.duplication.TypeBadge.video_tab',
      defaultMessage: 'Tab',
    },
  });

const TypeBadge: FC<{
  text?: string;
  itemType: DuplicableItemType;
  dense?: boolean;
}> = ({ text, itemType, dense = false }) => {
  const { t } = useTranslation();

  return (
    <Typography
      className={`px-2 ${
        dense ? 'py-0.5' : 'py-1'
      } border border-solid rounded-md mr-3`}
      fontWeight="inherit"
      variant="caption"
    >
      {text || t(translations[itemType])}
    </Typography>
  );
};

export default TypeBadge;
