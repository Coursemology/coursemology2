import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import ErrorCard from 'lib/components/ErrorCard';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import Note from 'lib/components/Note';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import CategoryCard from './CategoryCard';
import GroupTableCard from './GroupTableCard';
import { categoryShape, groupShape } from '../../propTypes';
import { fetchCourseUsers, fetchGroupData } from '../../actions';
import GroupManager from './GroupManager';
import actionTypes from '../../constants';

const translations = defineMessages({
  fetchFailure: {
    id: 'course.group.show.fetchFailure',
    defaultMessage: 'Failed to fetch group data! Please reload and try again.',
  },
  noCategory: {
    id: 'course.group.show.noCategory',
    defaultMessage: "You don't have a group category created! Create one now!",
  },
  noGroups: {
    id: 'course.group.show.noGroup',
    defaultMessage:
      "You don't have any groups under this category! Manage groups now to get started!",
  },
});

const Category = ({
  dispatch,
  groupCategory,
  groupCategoryId,
  groups,
  isFetching,
  isManagingGroups,
  hasFetchError,
  notification,
  canManageCategory,
  canManageGroups,
}) => {
  useEffect(() => {
    if (groupCategoryId) {
      dispatch(fetchGroupData(groupCategoryId));
    }
  }, [groupCategoryId]);

  // This is done as a separate call since it shouldn't slow down the render
  useEffect(() => {
    if (groupCategoryId) {
      dispatch(fetchCourseUsers(groupCategoryId));
    }
  }, [groupCategoryId]);

  if (isFetching) {
    return <LoadingIndicator />;
  }
  if (hasFetchError) {
    return (
      <ErrorCard
        message={<FormattedMessage {...translations.fetchFailure} />}
      />
    );
  }

  // This shouldn't happen, but just in case. Handles both null and undefined
  if (groupCategory == null) {
    return <Note message={<FormattedMessage {...translations.noCategory} />} />;
  }

  return (
    <>
      {canManageGroups && isManagingGroups ? (
        <GroupManager category={groupCategory} groups={groups} />
      ) : (
        <>
          <CategoryCard
            category={groupCategory}
            numGroups={groups.length}
            onManageGroups={() =>
              dispatch({ type: actionTypes.MANAGE_GROUPS_START })
            }
            canManageCategory={canManageCategory}
            canManageGroups={canManageGroups}
          />
          {groups.map((group) => (
            <GroupTableCard key={group.id} group={group} />
          ))}
          {groups.length === 0 ? (
            <Note message={<FormattedMessage {...translations.noGroups} />} />
          ) : null}
        </>
      )}
      <NotificationBar notification={notification} />
    </>
  );
};

Category.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isManagingGroups: PropTypes.bool.isRequired,
  canManageCategory: PropTypes.bool.isRequired,
  canManageGroups: PropTypes.bool.isRequired,
  hasFetchError: PropTypes.bool.isRequired,
  groupCategoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  groupCategory: categoryShape,
  groups: PropTypes.arrayOf(groupShape).isRequired,
  dispatch: PropTypes.func.isRequired,
  notification: notificationShape,
};

export default connect((state) => ({
  isFetching: state.groupsFetch.isFetching,
  hasFetchError: state.groupsFetch.hasFetchError,
  groupCategory: state.groupsFetch.groupCategory,
  groups: state.groupsFetch.groups,
  canManageCategory: state.groupsFetch.canManageCategory,
  canManageGroups: state.groupsFetch.canManageGroups,
  notification: state.notificationPopup,
  isManagingGroups: state.groupsManage.isManagingGroups,
}))(Category);
