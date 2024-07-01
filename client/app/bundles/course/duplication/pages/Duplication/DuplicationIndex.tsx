import { FC } from 'react';
import { defineMessages } from 'react-intl';

import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import Page from 'lib/components/core/layouts/Page';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicationBody from './DuplicationBody';

const translations = defineMessages({
  duplicateData: {
    id: 'course.duplication.Duplication.duplicateData',
    defaultMessage: 'Duplicate Data from {courseTitle}',
  },
});

const DuplicationIndex: FC = () => {
  const { t } = useTranslation();

  const duplication = useAppSelector(selectDuplicationStore);
  const { sourceCourse } = duplication;

  return (
    <Page
      title={t(translations.duplicateData, { courseTitle: sourceCourse.title })}
    >
      <DuplicationBody />
    </Page>
  );
};

export default DuplicationIndex;
