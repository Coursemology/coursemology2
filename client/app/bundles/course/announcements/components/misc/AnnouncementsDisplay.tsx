import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import {
  AnnouncementMiniEntity,
  AnnouncementPermissions,
} from 'types/course/announcements';
import { Grid, Stack } from '@mui/material';
import SearchBar from 'lib/components/SearchBar';
import Pagination from 'lib/components/Pagination';
import AnnouncementCard from './AnnouncementCard';

interface Props extends WrappedComponentProps {
  announcements: AnnouncementMiniEntity[];
  announcementPermissions: AnnouncementPermissions;
}

const translations = defineMessages({
  searchBarPlaceholder: {
    id: 'course.announcement.searchBarPlaceholder',
    defaultMessage: 'Search by title or content',
  },
});

const AnnouncementsDisplay: FC<Props> = (props) => {
  const { intl, announcements, announcementPermissions } = props;

  // For pagination
  const ITEMS_PER_PAGE = 12;
  const [slicedAnnouncements, setslicedAnnouncements] = useState(
    announcements.slice(0, ITEMS_PER_PAGE),
  );
  const [page, setPage] = useState(1);

  // For search bar
  const [shavedAnnouncements, setShavedAnnouncements] = useState(announcements);

  const handleSearchBarChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    if (event.target.value.trim() === '') {
      setShavedAnnouncements(announcements);
    } else {
      setShavedAnnouncements(
        announcements.filter(
          (announcement: AnnouncementMiniEntity) =>
            announcement.title
              .toLowerCase()
              .includes(event.target.value.trim().toLowerCase()) ||
            announcement.content
              .toLowerCase()
              .includes(event.target.value.trim().toLowerCase()),
        ),
      );
    }
  };

  return (
    <>
      <Grid style={{ padding: 0 }} container columns={{ xs: 1, lg: 3 }}>
        <Grid
          item
          xs={1}
          style={{
            display: 'flex',
            justifyContent: 'left',
          }}
        >
          <div style={{ paddingTop: 7, paddingBottom: 5 }}>
            <SearchBar
              placeholder={intl.formatMessage(
                translations.searchBarPlaceholder,
              )}
              width={350}
              onChange={handleSearchBarChange}
            />
          </div>
        </Grid>
        <Grid item xs={1}>
          <Pagination
            items={shavedAnnouncements}
            itemsPerPage={ITEMS_PER_PAGE}
            setSlicedItems={setslicedAnnouncements}
            page={page}
            setPage={setPage}
            padding={12}
          />
        </Grid>
        <Grid item xs={1} />
      </Grid>

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
          items={shavedAnnouncements}
          itemsPerPage={ITEMS_PER_PAGE}
          setSlicedItems={setslicedAnnouncements}
          page={page}
          setPage={setPage}
          padding={12}
        />
      )}
    </>
  );
};

export default injectIntl(AnnouncementsDisplay);
