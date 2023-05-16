import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';

import AnnouncementsDisplay from 'bundles/course/announcements/components/misc/AnnouncementsDisplay';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import { indexAnnouncements } from './operations';
import { getAllAnnouncementMiniEntities } from './selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'announcements.GlobalAnnouncementIndex.header',
    defaultMessage: 'All Announcements',
  },
  fetchAnnouncementsFailure: {
    id: 'announcements.GlobalAnnouncementIndex.fetchAnnouncementsFailure',
    defaultMessage: 'Unable to fetch announcements',
  },
});

const GlobalAnnouncementsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const announcements = useAppSelector(getAllAnnouncementMiniEntities);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(indexAnnouncements())
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAnnouncementsFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  const renderBody: JSX.Element = (
    <AnnouncementsDisplay
      announcementPermissions={{ canCreate: false }}
      announcements={announcements}
      canSticky={false}
    />
  );

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

export default injectIntl(GlobalAnnouncementsIndex);
