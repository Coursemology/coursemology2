import { FC } from 'react';

import { getComponentTitle } from 'course/translations';
import useTranslation from 'lib/hooks/useTranslation';

// TODO: properly handle this by separating raw strings & component keys.
const TranslatedItemType: FC<{ type: string }> = ({ type }) => {
  const { t } = useTranslation();
  const isTypeComponentKey = [
    'course_surveys_component',
    'course_videos_component',
  ].includes(type);

  return (
    <>
      {isTypeComponentKey && getComponentTitle(t, type)}
      {!isTypeComponentKey && type}
    </>
  );
};

export default TranslatedItemType;
