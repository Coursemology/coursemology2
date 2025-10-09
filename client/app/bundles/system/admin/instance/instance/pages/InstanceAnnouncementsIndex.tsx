import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import AnnouncementsDisplay from 'bundles/course/announcements/components/misc/AnnouncementsDisplay';
import AnnouncementNew from 'bundles/course/announcements/pages/AnnouncementNew';
import AddButton from 'lib/components/core/buttons/AddButton';
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

type Props = WrappedComponentProps;

const translations = defineMessages({
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
    defaultMessage: 'There are no announcements',
  },
});

const InstanceAnnouncementsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const announcements = useAppSelector(getAllAnnouncementMiniEntities);
  const announcementPermission = useAppSelector(getAnnouncementPermission);
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
      {announcementPermission && (
        <div className="w-full flex justify-end">
          <AddButton
            fixed
            id="new-announcement-button"
            onClick={(): void => setIsOpen(true)}
          >
            {intl.formatMessage(translations.newAnnouncement)}
          </AddButton>
        </div>
      )}

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
