import { FC } from 'react';
import { defineMessages } from 'react-intl';

import { duplicableItemTypes } from 'course/duplication/constants';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  [duplicableItemTypes.ASSESSMENT]: {
    id: 'course.duplication.TypeBadge.assessment',
    defaultMessage: 'Assessment',
  },
  [duplicableItemTypes.CATEGORY]: {
    id: 'course.duplication.TypeBadge.category',
    defaultMessage: 'Category',
  },
  [duplicableItemTypes.TAB]: {
    id: 'course.duplication.TypeBadge.tab',
    defaultMessage: 'Tab',
  },
  [duplicableItemTypes.SURVEY]: {
    id: 'course.duplication.TypeBadge.survey',
    defaultMessage: 'Survey',
  },
  [duplicableItemTypes.ACHIEVEMENT]: {
    id: 'course.duplication.TypeBadge.achievement',
    defaultMessage: 'Achievement',
  },
  [duplicableItemTypes.FOLDER]: {
    id: 'course.duplication.TypeBadge.folder',
    defaultMessage: 'Folder',
  },
  [duplicableItemTypes.MATERIAL]: {
    id: 'course.duplication.TypeBadge.material',
    defaultMessage: 'Material',
  },
  [duplicableItemTypes.VIDEO]: {
    id: 'course.duplication.TypeBadge.video',
    defaultMessage: 'Video',
  },
  [duplicableItemTypes.VIDEO_TAB]: {
    id: 'course.duplication.TypeBadge.video_tab',
    defaultMessage: 'Tab',
  },
});

interface Props {
  text?: string;
  itemType?: string;
}

const TypeBadge: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { text, itemType } = props;

  if (!text && !itemType) {
    return null;
  }

  return (
    <span className="px-[5px] py-[2px] mr-3 border border-solid rounded-lg text-xl justify-center font-bold">
      {text || t(translations[itemType!])}
    </span>
  );
};

export default TypeBadge;
