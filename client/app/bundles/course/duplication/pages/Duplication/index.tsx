import { FC } from 'react';
import { defineMessages } from 'react-intl';

import { fetchObjectsList } from 'course/duplication/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppDispatch } from 'lib/hooks/store';

import DuplicationIndex from './DuplicationIndex';

const translations = defineMessages({
  duplicationHandle: {
    id: 'course.duplication.Duplication.duplicationHandle',
    defaultMessage: 'Duplicate Data',
  },
  duplicateData: {
    id: 'course.duplication.Duplication.duplicateData',
    defaultMessage: 'Duplicate Data from {courseTitle}',
  },
});

const Duplication: FC = () => {
  const dispatch = useAppDispatch();
  const fetchLists = (): Promise<void> => dispatch(fetchObjectsList());

  return (
    <Preload render={<LoadingIndicator />} while={fetchLists}>
      {(): JSX.Element => <DuplicationIndex />}
    </Preload>
  );
};

const handle = translations.duplicationHandle;

export default Object.assign(Duplication, { handle });
