import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppState, AppDispatch } from 'types/store';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { Stack } from '@mui/material';
import { getAllAnnouncementMiniEntities } from '../../selectors';
import {
  indexAnnouncements,
  deleteAnnouncement,
  updateAnnouncement,
  createAnnouncement,
} from '../../operations';
import AnnouncementCard from '../../../../../course/announcements/components/misc/AnnouncementCard';
import NewAnnouncementButton from '../../../../../course/announcements/components/buttons/NewAnnouncementButton';
import AnnouncementNew from '../../../../../course/announcements/pages/AnnouncementNew';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.announcements.header',
    defaultMessage: 'System Announcements',
  },
  fetchAnnouncementsFailure: {
    id: 'system.admin.announcements.fetch.failure',
    defaultMessage: 'Unable to fetch announcements',
  },
});

const AnnouncementsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const headerToolbars: ReactElement[] = [];
  const announcements = useSelector((state: AppState) =>
    getAllAnnouncementMiniEntities(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(indexAnnouncements())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAnnouncementsFailure)),
      );
  }, [dispatch]);

  headerToolbars.push(
    <NewAnnouncementButton
      key="new-announcement-button"
      setIsOpen={setIsOpen}
    />,
  );

  const renderBody: JSX.Element = (
    <>
      <Stack spacing={1}>
        {announcements
          .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime))
          .map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              showEditOptions
              updateOperation={updateAnnouncement}
              deleteOperation={deleteAnnouncement}
              canSticky={false}
            />
          ))}
      </Stack>
      <AnnouncementNew
        open={isOpen}
        handleClose={(): void => setIsOpen(false)}
        createOperation={createAnnouncement}
        canSticky={false}
      />
    </>
  );

  return (
    <>
      <PageHeader
        title={intl.formatMessage(translations.header)}
        toolbars={headerToolbars}
      />
      {isLoading ? <LoadingIndicator /> : <>{renderBody}</>}
    </>
  );
};

export default injectIntl(AnnouncementsIndex);
