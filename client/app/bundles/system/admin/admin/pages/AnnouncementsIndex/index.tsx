import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';

import AnnouncementsDisplay from 'bundles/course/announcements/components/misc/AnnouncementsDisplay';
import AnnouncementNew from 'bundles/course/announcements/pages/AnnouncementNew';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import {
  createAnnouncement,
  deleteAnnouncement,
  indexAnnouncements,
  updateAnnouncement,
} from '../../operations';
import { getAllAnnouncementMiniEntities } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.admin.AnnouncementsIndex.header',
    defaultMessage: 'System Announcements',
  },
  fetchAnnouncementsFailure: {
    id: 'system.admin.admin.AnnouncementsIndex.fetchAnnouncementsFailure',
    defaultMessage: 'Unable to fetch announcements',
  },
  newAnnouncement: {
    id: 'system.admin.admin.AnnouncementsIndex.newAnnouncement',
    defaultMessage: 'New Announcement',
  },
});

const AnnouncementsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const headerToolbars: ReactElement[] = [];
  const announcements = useAppSelector(getAllAnnouncementMiniEntities);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(indexAnnouncements())
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAnnouncementsFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  headerToolbars.push(
    <Button
      key="new-announcement-button"
      id="new-announcement-button"
      onClick={(): void => {
        setIsOpen(true);
      }}
      variant="outlined"
    >
      {intl.formatMessage(translations.newAnnouncement)}
    </Button>,
  );

  const renderBody: JSX.Element = (
    <>
      <AnnouncementsDisplay
        announcementPermissions={{ canCreate: true }}
        announcements={announcements}
        canSticky={false}
        deleteOperation={deleteAnnouncement}
        updateOperation={updateAnnouncement}
      />
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

export default injectIntl(AnnouncementsIndex);
