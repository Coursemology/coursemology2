import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';

import AnnouncementsDisplay from 'bundles/course/announcements/components/misc/AnnouncementsDisplay';
import AnnouncementNew from 'bundles/course/announcements/pages/AnnouncementNew';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import {
  createAnnouncement,
  deleteAnnouncement,
  indexAnnouncements,
  updateAnnouncement,
} from '../operations';
import { getAllAnnouncementMiniEntities } from '../selectors';

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

  const announcements = useAppSelector(getAllAnnouncementMiniEntities);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(indexAnnouncements())
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAnnouncementsFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  if (isLoading) return <LoadingIndicator />;

  return (
    <Page>
      <Button
        key="new-announcement-button"
        id="new-announcement-button"
        onClick={(): void => {
          setIsOpen(true);
        }}
        variant="outlined"
      >
        {intl.formatMessage(translations.newAnnouncement)}
      </Button>

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
    </Page>
  );
};

export default injectIntl(AnnouncementsIndex);
