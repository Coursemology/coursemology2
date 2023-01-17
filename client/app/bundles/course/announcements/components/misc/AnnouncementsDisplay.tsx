import { FC, memo, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Grid, Stack } from '@mui/material';
import equal from 'fast-deep-equal';
import {
  AnnouncementFormData,
  AnnouncementMiniEntity,
  AnnouncementPermissions,
} from 'types/course/announcements';
import { Operation } from 'types/store';

import SearchField from 'lib/components/core/fields/SearchField';
import Pagination from 'lib/components/core/layouts/Pagination';

import AnnouncementCard from './AnnouncementCard';

interface Props extends WrappedComponentProps {
  announcements: AnnouncementMiniEntity[];
  announcementPermissions: AnnouncementPermissions;
  updateOperation?: (
    announcementId: number,
    formData: AnnouncementFormData,
  ) => Operation;
  deleteOperation?: (announcementId: number) => Operation;
  canSticky?: boolean;
}

const translations = defineMessages({
  searchBarPlaceholder: {
    id: 'course.announcement.AnnouncementsDisplay.searchBarPlaceholder',
    defaultMessage: 'Search by title or content',
  },
});

const AnnouncementsDisplay: FC<Props> = (props) => {
  const {
    intl,
    announcements,
    announcementPermissions,
    updateOperation,
    deleteOperation,
    canSticky = true,
  } = props;

  // For pagination
  const ITEMS_PER_PAGE = 12;
  const [slicedAnnouncements, setslicedAnnouncements] = useState(
    announcements.slice(0, ITEMS_PER_PAGE),
  );
  const [page, setPage] = useState(1);

  // For search bar
  const [shavedAnnouncements, setShavedAnnouncements] = useState(announcements);

  useEffect(() => {
    setShavedAnnouncements(announcements);
  }, [announcements]);

  const handleSearchBarChange = (rawKeyword: string): void => {
    const keyword = rawKeyword.trim();

    if (keyword === '') {
      setShavedAnnouncements(announcements);
    } else {
      setShavedAnnouncements(
        announcements.filter(
          (announcement: AnnouncementMiniEntity) =>
            announcement.title.toLowerCase().includes(keyword.toLowerCase()) ||
            announcement.content.toLowerCase().includes(keyword.toLowerCase()),
        ),
      );
    }
  };

  return (
    <>
      <Grid columns={{ xs: 1, lg: 3 }} container style={{ padding: 0 }}>
        <Grid
          item
          style={{
            display: 'flex',
            justifyContent: 'left',
          }}
          xs={1}
        >
          <div style={{ paddingTop: 7, paddingBottom: 5 }}>
            <SearchField
              className="w-[350px]"
              onChangeKeyword={handleSearchBarChange}
              placeholder={intl.formatMessage(
                translations.searchBarPlaceholder,
              )}
            />
          </div>
        </Grid>
        <Grid item xs={1}>
          <Pagination
            items={shavedAnnouncements}
            itemsPerPage={ITEMS_PER_PAGE}
            padding={12}
            page={page}
            setPage={setPage}
            setSlicedItems={setslicedAnnouncements}
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
              canSticky={canSticky}
              deleteOperation={deleteOperation}
              showEditOptions={announcementPermissions.canCreate}
              updateOperation={updateOperation}
            />
          ))}
        </Stack>
      </div>

      {slicedAnnouncements.length > 6 && (
        <Pagination
          items={shavedAnnouncements}
          itemsPerPage={ITEMS_PER_PAGE}
          padding={12}
          page={page}
          setPage={setPage}
          setSlicedItems={setslicedAnnouncements}
        />
      )}
    </>
  );
};

export default memo(
  injectIntl(AnnouncementsDisplay),
  (prevProps, nextProps) => {
    return (
      equal(prevProps.announcements, nextProps.announcements) &&
      equal(
        prevProps.announcementPermissions,
        nextProps.announcementPermissions,
      )
    );
  },
);
