import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
} from '@mui/material';
import { toast } from 'react-toastify';
import { defineMessages, useIntl } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import CloseIcon from '@mui/icons-material/Close';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { formatLongDateTime } from 'lib/moment';
import { ForumDisbursementUserEntity } from 'types/course/disbursement';
import FilterForm from '../../components/forms/FilterForm';
import ForumDisbursementForm from '../../components/forms/ForumDisbursementForm';
import ForumPostTable from '../../components/tables/ForumPostTable';
import {
  getAllForumDisbursementUserEntities,
  getFilters,
  getAllForumPostEntitiesForUser,
} from '../../selectors';
import { fetchForumPost } from '../../operations';

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
      <Grid item xs>
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
      <Grid item xs>
        <ForumDisbursementForm
          filters={filters}
          forumUsers={forumUsers}
          onPostClick={onPostClick}
        />
        {selectedForumPostUser && (
          <Dialog
            open={!!forumPosts}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              style: { overflowY: 'inherit' },
            }}
            onClose={(): void => setSelectedForumPostUser(null)}
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
