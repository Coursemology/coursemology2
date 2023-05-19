import { FC, memo } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Grid, Stack } from '@mui/material';
import equal from 'fast-deep-equal';
import { Operation } from 'store';
import {
  AnnouncementEntity,
  AnnouncementFormData,
  AnnouncementPermissions,
} from 'types/course/announcements';

import SearchField from 'lib/components/core/fields/SearchField';
import Pagination from 'lib/components/core/layouts/Pagination';
import useItems from 'lib/hooks/items/useItems';

import AnnouncementCard from './AnnouncementCard';

interface Props extends WrappedComponentProps {
  announcements: AnnouncementEntity[];
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

const itemsPerPage = 12;

const searchKeys: (keyof AnnouncementEntity)[] = ['title', 'content'];

export const sortFunc = (
  announcements: AnnouncementEntity[],
): AnnouncementEntity[] => {
  const sortedAnnouncements = [...announcements];
  sortedAnnouncements
    .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime))
    .sort((a, b) => Number(b.isSticky) - Number(a.isSticky))
    .sort((a, b) => Number(b.isCurrentlyActive) - Number(a.isCurrentlyActive));
  return sortedAnnouncements;
};

const AnnouncementsDisplay: FC<Props> = (props) => {
  const {
    intl,
    announcements,
    announcementPermissions,
    updateOperation,
    deleteOperation,
    canSticky = true,
  } = props;

  const {
    processedItems: processedAnnouncements,
    handleSearch,
    currentPage,
    totalPages,
    handlePageChange,
  } = useItems(announcements, searchKeys, sortFunc, itemsPerPage);

  return (
    <>
      <Grid className="flex items-center" columns={{ xs: 1, lg: 3 }} container>
        <Grid className="lg:justify-left flex " item xs={1}>
          <SearchField
            className="my-4 w-full"
            onChangeKeyword={handleSearch}
            placeholder={intl.formatMessage(translations.searchBarPlaceholder)}
          />
        </Grid>
        <Grid item xs={1}>
          <Pagination
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            totalPages={totalPages}
          />
        </Grid>
        <Grid item xs={1} />
      </Grid>

      <div id="course-announcements">
        <Stack spacing={1}>
          {processedAnnouncements.map((announcement) => (
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

      {processedAnnouncements.length > 6 && (
        <Pagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
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
