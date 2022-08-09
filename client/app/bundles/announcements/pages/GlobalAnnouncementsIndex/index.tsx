import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppState, AppDispatch } from 'types/store';
import AnnouncementsDisplay from '../../../course/announcements/components/misc/AnnouncementsDisplay';
import {
  indexAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../operations';
import { getAllAnnouncementMiniEntities } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'announcements.header',
    defaultMessage: 'All Announcements',
  },
  fetchAnnouncementsFailure: {
    id: 'system.admin.announcements.fetch.failure',
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
    setIsLoading(true);
    dispatch(indexAnnouncements())
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAnnouncementsFailure)),
      )
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const renderBody: JSX.Element | undefined = announcements && (
    <AnnouncementsDisplay
      announcements={announcements.sort(
        (a, b) => Date.parse(b.startTime) - Date.parse(a.startTime),
      )}
      announcementPermissions={{ canCreate: true }}
      updateOperation={updateAnnouncement}
      deleteOperation={deleteAnnouncement}
      canSticky={false}
    />
  );

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      {isLoading ? <LoadingIndicator /> : <>{renderBody}</>}
    </>
  );
};

export default injectIntl(GlobalAnnouncementsIndex);
