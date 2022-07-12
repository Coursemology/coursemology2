import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppState, AppDispatch } from 'types/store';
import AddButton from 'lib/components/buttons/AddButton';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { getAllAnnouncementMiniEntities } from '../../selectors';
import {
  indexAnnouncements,
  deleteAnnouncement,
  updateAnnouncement,
  createAnnouncement,
} from '../../operations';
import AnnouncementsDisplay from '../../../../../course/announcements/components/misc/AnnouncementsDisplay';
import AnnouncementNew from '../../../../../course/announcements/pages/AnnouncementNew';

type Props = WrappedComponentProps;

const styles = {
  newButton: {
    color: 'white',
  },
};

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
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAnnouncementsFailure)),
      );
  }, [dispatch]);

  headerToolbars.push(
    <AddButton
      id="new-announcement-button"
      key="new-announcement-button"
      onClick={(): void => {
        setIsOpen(true);
      }}
      tooltip={intl.formatMessage(translations.newAnnouncement)}
      sx={styles.newButton}
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
        handleClose={(): void => setIsOpen(false)}
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
