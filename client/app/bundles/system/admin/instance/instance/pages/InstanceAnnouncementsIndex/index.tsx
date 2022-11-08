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
import {
  indexAnnouncements,
  updateAnnouncement,
  createAnnouncement,
  deleteAnnouncement,
} from '../../operations';
import {
  getAllAnnouncementMiniEntities,
  getAnnouncementPermission,
} from '../../selectors';

type Props = WrappedComponentProps;

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
  noAnnouncements: {
    id: 'system.admin.instance.announcements.noAnnouncement',
    defaultMessage: 'There is no announcement',
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
  const announcementPermission = useSelector((state: AppState) =>
    getAnnouncementPermission(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(indexAnnouncements())
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAnnouncementsFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  if (announcementPermission) {
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
  }

  const renderBody: JSX.Element = (
    <>
      {announcements.length === 0 ? (
        <div>{intl.formatMessage(translations.noAnnouncements)}</div>
      ) : (
        <AnnouncementsDisplay
          announcements={announcements.sort(
            (a, b) => Date.parse(b.startTime) - Date.parse(a.startTime),
          )}
          announcementPermissions={{ canCreate: announcementPermission }}
          updateOperation={updateAnnouncement}
          deleteOperation={deleteAnnouncement}
          canSticky={false}
        />
      )}
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

export default injectIntl(InstanceAnnouncementsIndex);
