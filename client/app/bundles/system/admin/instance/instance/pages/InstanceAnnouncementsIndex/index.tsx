import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';

import AnnouncementsDisplay from 'bundles/course/announcements/components/misc/AnnouncementsDisplay';
import AnnouncementNew from 'bundles/course/announcements/pages/AnnouncementNew';
import AddButton from 'lib/components/core/buttons/AddButton';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';

import {
  createAnnouncement,
  deleteAnnouncement,
  indexAnnouncements,
  updateAnnouncement,
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
        key="new-announcement-button"
        className="text-white"
        id="new-announcement-button"
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
          announcementPermissions={{ canCreate: announcementPermission }}
          announcements={announcements.sort(
            (a, b) => Date.parse(b.startTime) - Date.parse(a.startTime),
          )}
          canSticky={false}
          deleteOperation={deleteAnnouncement}
          updateOperation={updateAnnouncement}
        />
      )}
      <AnnouncementNew
        canSticky={false}
        createOperation={createAnnouncement}
        onClose={(): void => setIsOpen(false)}
        open={isOpen}
      />
    </>
  );

  return (
    <>
      <PageHeader
        title={intl.formatMessage(translations.header)}
        toolbars={headerToolbars}
      />
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

export default injectIntl(InstanceAnnouncementsIndex);
