import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';

import AnnouncementsDisplay from 'bundles/course/announcements/components/misc/AnnouncementsDisplay';
import AnnouncementNew from 'bundles/course/announcements/pages/AnnouncementNew';
import AddButton from 'lib/components/core/buttons/AddButton';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import PageHeader from 'lib/components/navigation/PageHeader';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

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
    id: 'system.admin.instance.instance.InstanceAnnouncementsIndex.header',
    defaultMessage: 'Instance Announcements',
  },
  fetchAnnouncementsFailure: {
    id: 'system.admin.instance.instance.InstanceAnnouncementsIndex.fetchAnnouncementsFailure',
    defaultMessage: 'Unable to fetch announcements',
  },
  newAnnouncement: {
    id: 'system.admin.instance.instance.InstanceAnnouncementsIndex.newAnnouncement',
    defaultMessage: 'New Announcement',
  },
  noAnnouncements: {
    id: 'system.admin.instance.instance.InstanceAnnouncementsIndex.noAnnouncement',
    defaultMessage: 'There is no announcement',
  },
});

const InstanceAnnouncementsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const headerToolbars: ReactElement[] = [];
  const announcements = useAppSelector(getAllAnnouncementMiniEntities);
  const announcementPermission = useAppSelector(getAnnouncementPermission);
  const dispatch = useAppDispatch();

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
        <Note message={intl.formatMessage(translations.noAnnouncements)} />
      ) : (
        <AnnouncementsDisplay
          announcementPermissions={{ canCreate: announcementPermission }}
          announcements={announcements}
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
