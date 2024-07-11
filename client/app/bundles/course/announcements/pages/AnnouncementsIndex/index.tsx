import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import NewAnnouncementButton from '../../components/buttons/NewAnnouncementButton';
import AnnouncementsDisplay from '../../components/misc/AnnouncementsDisplay';
import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncements,
  updateAnnouncement,
} from '../../operations';
import {
  getAllAnnouncementMiniEntities,
  getAnnouncementPermissions,
  getAnnouncementTitle,
} from '../../selectors';
import AnnouncementNew from '../AnnouncementNew';

const translations = defineMessages({
  fetchAnnouncementsFailure: {
    id: 'course.announcements.AnnouncementsIndex.fetchAnnouncementsFailure',
    defaultMessage: 'Failed to fetch announcements',
  },
  header: {
    id: 'course.announcements.AnnouncementsIndex.header',
    defaultMessage: 'Announcements',
  },
  noAnnouncements: {
    id: 'course.announcements.AnnouncementsIndex.noAnnouncements',
    defaultMessage: 'There are no announcements',
  },
  searchBarPlaceholder: {
    id: 'course.announcements.AnnouncementsIndex.searchBarPlaceholder',
    defaultMessage: 'Search by announcement title',
  },
});

const AnnouncementsIndex = (): JSX.Element => {
  const { t } = useTranslation();

  // For new announcements form dialog
  const [isOpen, setIsOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const announcements = useAppSelector(getAllAnnouncementMiniEntities);
  const announcementTitle = useAppSelector(getAnnouncementTitle);
  const announcementPermissions = useAppSelector(getAnnouncementPermissions);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAnnouncements())
      .catch(() => toast.error(t(translations.fetchAnnouncementsFailure)))
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  return (
    <Page
      actions={
        announcementPermissions.canCreate && (
          <NewAnnouncementButton
            key="new-announcement-button"
            setIsOpen={setIsOpen}
          />
        )
      }
      title={announcementTitle || t(translations.header)}
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          {announcements.length === 0 ? (
            <Note message={t(translations.noAnnouncements)} />
          ) : (
            <AnnouncementsDisplay
              announcementPermissions={announcementPermissions}
              announcements={announcements}
              deleteOperation={deleteAnnouncement}
              updateOperation={updateAnnouncement}
            />
          )}
          <AnnouncementNew
            createOperation={createAnnouncement}
            onClose={(): void => setIsOpen(false)}
            open={isOpen}
          />
        </>
      )}
    </Page>
  );
};

const handle = translations.header;

export default Object.assign(AnnouncementsIndex, { handle });
