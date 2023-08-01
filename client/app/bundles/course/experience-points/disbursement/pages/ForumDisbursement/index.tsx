import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
} from '@mui/material';
import { ForumDisbursementUserEntity } from 'types/course/disbursement';

import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import FilterForm from '../../components/forms/FilterForm';
import ForumDisbursementForm from '../../components/forms/ForumDisbursementForm';
import ForumPostTable from '../../components/tables/ForumPostTable';
import { fetchForumPost } from '../../operations';
import {
  getAllForumDisbursementUserEntities,
  getAllForumPostEntitiesForUser,
  getFilters,
} from '../../selectors';

const translations = defineMessages({
  postListDialogHeader: {
    id: 'course.experiencePoints.disbursement.ForumDisbursementForm.postListDialogHeader',
    defaultMessage: 'Posts created between {startDate} and {endDate} by',
  },
  fetchForumPostsFailure: {
    id: 'course.experiencePoints.disbursement.ForumDisbursementForm.fetchForumPostsFailure',
    defaultMessage: 'Failed to fetch forum posts.',
  },
});

const ForumDisbursement: FC = () => {
  const retrievedPostUserIds = new Set();
  const { t } = useTranslation();
  const [selectedForumPostUser, setSelectedForumPostUser] =
    useState<ForumDisbursementUserEntity | null>();

  const filters = useAppSelector(getFilters);
  const forumUsers = useAppSelector(getAllForumDisbursementUserEntities);
  const forumPosts = useAppSelector((state) =>
    getAllForumPostEntitiesForUser(state, selectedForumPostUser?.id),
  );
  const dispatch = useAppDispatch();

  const onPostClick = (user: ForumDisbursementUserEntity): void => {
    if (retrievedPostUserIds.has(user.id)) {
      setSelectedForumPostUser(user);
    } else {
      dispatch(fetchForumPost(user, filters))
        .then(() => {
          setSelectedForumPostUser(user);
          retrievedPostUserIds.add(user.id);
        })
        .catch(() => {
          toast.error(t(translations.fetchForumPostsFailure));
        });
    }
  };

  return (
    <Page.PaddedSection>
      <Grid item xs>
        <Paper
          sx={{
            padding: '5px 10px 0px 10px',
            marginBottom: '5px',
            display: 'flex',
            alignItems: 'center',
          }}
          variant="outlined"
        >
          <FilterForm
            initialValues={{
              startTime: filters.startTime,
              endTime: filters.endTime,
              weeklyCap: filters.weeklyCap,
            }}
          />
        </Paper>
      </Grid>
      <Grid item xs>
        {Boolean(forumUsers.length) && (
          <ForumDisbursementForm
            filters={filters}
            forumUsers={forumUsers}
            onPostClick={onPostClick}
          />
        )}
        {selectedForumPostUser && (
          <Dialog
            fullWidth
            maxWidth="lg"
            onClose={(): void => setSelectedForumPostUser(null)}
            open={!!forumPosts}
            PaperProps={{
              style: { overflowY: 'inherit' },
            }}
            style={{
              top: 40,
            }}
          >
            <DialogTitle
              borderBottom="1px solid #ccc"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 10px 10px 24px',
              }}
            >
              <div>
                {t(translations.postListDialogHeader, {
                  startDate: formatLongDateTime(filters.startTime),
                  endDate: formatLongDateTime(filters.endTime),
                })}{' '}
                <Link
                  to={getCourseUserURL(getCourseId(), selectedForumPostUser.id)}
                >
                  {selectedForumPostUser.name}
                </Link>
              </div>
              <IconButton onClick={(): void => setSelectedForumPostUser(null)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent style={{ height: '70vh', padding: '0px' }}>
              <ForumPostTable posts={forumPosts} />
            </DialogContent>
          </Dialog>
        )}
      </Grid>
    </Page.PaddedSection>
  );
};

export default ForumDisbursement;
