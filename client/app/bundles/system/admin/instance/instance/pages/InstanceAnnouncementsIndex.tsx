import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Button, useMediaQuery } from '@mui/material';

import AnnouncementsDisplay from 'bundles/course/announcements/components/misc/AnnouncementsDisplay';
import AnnouncementNew from 'bundles/course/announcements/pages/AnnouncementNew';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import {
  createAnnouncement,
  deleteAnnouncement,
  indexAnnouncements,
  updateAnnouncement,
} from '../operations';
import {
  getAllAnnouncementMiniEntities,
  getAnnouncementPermission,
} from '../selectors';
import AddButton from 'lib/components/core/buttons/AddButton';

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

  const announcements = useAppSelector(getAllAnnouncementMiniEntities);
  const announcementPermission = useAppSelector(getAnnouncementPermission);
  const dispatch = useAppDispatch();

  const minWidthForAddButtonWithText = useMediaQuery('(min-width:720px)');

  useEffect(() => {
    dispatch(indexAnnouncements())
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAnnouncementsFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  if (isLoading) return <LoadingIndicator />;

  return (
    <Page
      actions={
        announcementPermission &&
        (minWidthForAddButtonWithText ? (
          <Button
            className="float-right"
            id="new-announcement-button"
            onClick={(): void => setIsOpen(true)}
            variant="outlined"
          >
            {intl.formatMessage(translations.newAnnouncement)}
          </Button>
        ) : (
          <AddButton
            key="new-announcement-button"
            className="float-right"
            onClick={(): void => setIsOpen(true)}
            tooltip={intl.formatMessage(translations.newAnnouncement)}
          />
        ))
      }
      title={intl.formatMessage(translations.header)}
    >
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
    </Page>
  );
};

export default injectIntl(InstanceAnnouncementsIndex);
