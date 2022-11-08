import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/navigation/PageHeader';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppState, AppDispatch } from 'types/store';
import AddButton from 'lib/components/core/buttons/AddButton';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import AnnouncementsDisplay from 'bundles/course/announcements/components/misc/AnnouncementsDisplay';
import AnnouncementNew from 'bundles/course/announcements/pages/AnnouncementNew';
import { getAllAnnouncementMiniEntities } from '../../selectors';
import {
  indexAnnouncements,
  deleteAnnouncement,
  updateAnnouncement,
  createAnnouncement,
} from '../../operations';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.announcements.header',
    defaultMessage: 'System Announcements',
  },
  fetchAnnouncementsFailure: {
    id: 'system.admin.announcements.fetch.failure',
    defaultMessage: 'Unable to fetch announcements',
  },
  newAnnouncement: {
    id: 'system.admin.announcements.new',
    defaultMessage: 'New Announcement',
  },
});

const AnnouncementsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const headerToolbars: ReactElement[] = [];
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

  headerToolbars.push(
    <AddButton
      className="text-white"
      id="new-announcement-button"
      key="new-announcement-button"
      onClick={(): void => {
        setIsOpen(true);
      }}
      tooltip={intl.formatMessage(translations.newAnnouncement)}
    />,
  );

  const renderBody: JSX.Element = (
    <>
      <AnnouncementsDisplay
        announcements={announcements.sort(
          (a, b) => Date.parse(b.startTime) - Date.parse(a.startTime),
        )}
        announcementPermissions={{ canCreate: true }}
        updateOperation={updateAnnouncement}
        deleteOperation={deleteAnnouncement}
        canSticky={false}
      />
      <AnnouncementNew
        open={isOpen}
        onClose={(): void => setIsOpen(false)}
        createOperation={createAnnouncement}
        canSticky={false}
      />
    </>
  );

  return (
    <>
      <PageHeader
        title={intl.formatMessage(translations.header)}
        toolbars={headerToolbars}
      />
      {isLoading ? <LoadingIndicator /> : <>{renderBody}</>}
    </>
  );
};

export default injectIntl(AnnouncementsIndex);
