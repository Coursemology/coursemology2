import { FC, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
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
import { AppDispatch, AppState } from 'types/store';

import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
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
  fetchForumPostsFailure: {
    id: 'course.experience-points.disbursement.ForumDisbursementForm.fetchForumPosts',
    defaultMessage: 'Failed to fetch forum posts.',
  },
});

const ForumDisbursement: FC = () => {
  const retrievedPostUserIds = new Set();
  const intl = useIntl();
  const [selectedForumPostUser, setSelectedForumPostUser] =
    useState<ForumDisbursementUserEntity | null>();

  const filters = useSelector((state: AppState) => getFilters(state));
  const forumUsers = useSelector((state: AppState) =>
    getAllForumDisbursementUserEntities(state),
  );
  const forumPosts = useSelector((state: AppState) =>
    getAllForumPostEntitiesForUser(state, selectedForumPostUser?.id),
  );
  const dispatch = useDispatch<AppDispatch>();

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
          toast.error(intl.formatMessage(translations.fetchForumPostsFailure));
        });
    }
  };

  return (
    <>
      <Grid item={true} xs={true}>
        <Paper
          elevation={3}
          sx={{
            padding: '5px 10px 0px 10px',
            marginBottom: '5px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#eeeeee',
          }}
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
      <Grid item={true} xs={true}>
        <ForumDisbursementForm
          filters={filters}
          forumUsers={forumUsers}
          onPostClick={onPostClick}
        />
        {selectedForumPostUser && (
          <Dialog
            fullWidth={true}
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
                {'Posts by '}
                <a
                  href={getCourseUserURL(
                    getCourseId(),
                    selectedForumPostUser.id,
                  )}
                >
                  {selectedForumPostUser.name}
                </a>
                {` made between ${formatLongDateTime(
                  filters.startTime,
                )} and ${formatLongDateTime(filters.endTime)}`}
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
    </>
  );
};

export default ForumDisbursement;
