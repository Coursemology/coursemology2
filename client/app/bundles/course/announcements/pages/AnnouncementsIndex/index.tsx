import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import PageHeader from 'lib/components/navigation/PageHeader';

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
} from '../../selectors';
import AnnouncementNew from '../AnnouncementNew';

interface Props extends WrappedComponentProps {}

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

const AnnouncementsIndex: FC<Props> = (props) => {
  const { intl } = props;

  // For new announcements form dialog
  const [isOpen, setIsOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const announcements = useSelector((state: AppState) =>
    getAllAnnouncementMiniEntities(state),
  );
  const announcementPermissions = useSelector((state: AppState) =>
    getAnnouncementPermissions(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchAnnouncements())
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAnnouncementsFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  return (
    <>
      <PageHeader
        title={intl.formatMessage(translations.header)}
        toolbars={
          announcementPermissions.canCreate
            ? [
                <NewAnnouncementButton
                  key="new-announcement-button"
                  setIsOpen={setIsOpen}
                />,
              ]
            : undefined
        }
      />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          {announcements.length === 0 ? (
            <Note message={intl.formatMessage(translations.noAnnouncements)} />
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
    </>
  );
};

export default injectIntl(AnnouncementsIndex);
