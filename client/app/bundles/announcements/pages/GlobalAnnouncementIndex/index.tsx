import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';

import AnnouncementsDisplay from 'bundles/course/announcements/components/misc/AnnouncementsDisplay';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';

import { indexAnnouncements } from '../../operations';
import { getAllAnnouncementMiniEntities } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'announcements.header',
    defaultMessage: 'All Announcements',
  },
  fetchAnnouncementsFailure: {
    id: 'announcements.fetch.failure',
    defaultMessage: 'Unable to fetch announcements',
  },
});

const GlobalAnnouncementsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const announcements = useSelector((state: AppState) =>
    getAllAnnouncementMiniEntities(state),
  );
  const dispatch = useDispatch<AppDispatch>();

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
      announcements={announcements.sort(
        (a, b) => Date.parse(b.startTime) - Date.parse(a.startTime),
      )}
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
