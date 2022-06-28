import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import Pagination from 'lib/components/Pagination';

import { Stack } from '@mui/material';

import { fetchAnnouncements } from '../../operations';
import {
  getAllAnnouncementMiniEntities,
  getAnnouncementPermissions,
} from '../../selectors';

import AnnouncementCard from '../../components/misc/AnnouncementCard';
import NewAnnouncementButton from '../../components/buttons/NewAnnouncementButton';
import AnnouncementNew from '../AnnouncementNew';

interface Props extends WrappedComponentProps {}

const translations = defineMessages({
  fetchAnnouncementsFailure: {
    id: 'course.announcement.fetchAnnouncementsFailure',
    defaultMessage: 'Failed to fetch announcements',
  },
  header: {
    id: 'course.announcement.header',
    defaultMessage: 'Announcements',
  },
  noAnnouncements: {
    id: 'course.announcement.noAnnouncements',
    defaultMessage: 'There are no announcements',
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

  // For pagination
  const ITEMS_PER_PAGE = 12;
  const [slicedAnnouncements, setslicedAnnouncements] = useState(
    announcements.slice(0, ITEMS_PER_PAGE),
  );
  const [page, setPage] = useState(1);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchAnnouncements())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAnnouncementsFailure)),
      );
  }, [dispatch]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

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
      {announcements.length === 0 ? (
        <div>{intl.formatMessage(translations.noAnnouncements)}</div>
      ) : (
        <>
          <Pagination
            items={announcements}
            itemsPerPage={ITEMS_PER_PAGE}
            setSlicedItems={setslicedAnnouncements}
            page={page}
            setPage={setPage}
            padding={12}
          />
          <div id="course-announcements">
            <Stack spacing={1} sx={{ paddingBottom: 1 }}>
              {slicedAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  showEditOptions={announcementPermissions.canCreate}
                />
              ))}
            </Stack>
          </div>

          {slicedAnnouncements.length > 6 && (
            <Pagination
              items={announcements}
              itemsPerPage={ITEMS_PER_PAGE}
              setSlicedItems={setslicedAnnouncements}
              page={page}
              setPage={setPage}
              padding={12}
            />
          )}
        </>
      )}

      <AnnouncementNew
        open={isOpen}
        handleClose={(): void => setIsOpen(false)}
      />
    </>
  );
};

export default injectIntl(AnnouncementsIndex);
