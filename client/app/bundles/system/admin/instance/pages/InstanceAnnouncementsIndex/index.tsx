import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppState, AppDispatch } from 'types/store';
import AddButton from 'lib/components/buttons/AddButton';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import {
  indexAnnouncements,
  updateAnnouncement,
  createAnnouncement,
  deleteAnnouncement,
} from '../../operations';
import { getAllAnnouncementMiniEntities } from '../../selectors';
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
    id: 'system.admin.instance.announcements.header',
    defaultMessage: 'Instance Announcements',
  },
  fetchAnnouncementsFailure: {
    id: 'system.admin.instance.announcements.fetch.failure',
    defaultMessage: 'Unable to fetch announcements',
  },
  newAnnouncement: {
    id: 'system.admin.instance.announcements.new',
    defaultMessage: 'New Announcement',
  },
});

const InstanceAnnouncementsIndex: FC<Props> = (props) => {
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

export default injectIntl(InstanceAnnouncementsIndex);
