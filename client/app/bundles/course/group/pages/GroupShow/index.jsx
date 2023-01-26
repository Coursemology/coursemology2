import { useCallback, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import NotificationBar, {
  notificationShape,
} from 'lib/components/core/NotificationBar';

import { fetchCourseUsers, fetchGroupData } from '../../actions';
import actionTypes from '../../constants';
import { categoryShape, groupShape } from '../../propTypes';

import CategoryCard from './CategoryCard';
import GroupManager from './GroupManager';
import GroupTableCard from './GroupTableCard';

const translations = defineMessages({
  fetchFailure: {
    id: 'course.group.GroupShow.fetchFailure',
    defaultMessage: 'Failed to fetch group data! Please reload and try again.',
  },
  noCategory: {
    id: 'course.group.GroupShow.noCategory',
    defaultMessage: "You don't have a group category created! Create one now!",
  },
  noGroups: {
    id: 'course.group.GroupShow.noGroups',
    defaultMessage:
      "You don't have any groups under this category! Manage groups now to get started!",
  },
});

const Category = ({
  dispatch,
  groupCategory,
  groups,
  isFetching,
  isManagingGroups,
  hasFetchError,
  notification,
  canManageCategory,
  canManageGroups,
}) => {
  const { groupCategoryId } = useParams();
  const handleGroupSelect = useCallback(
    (groupId) =>
      dispatch({
        type: actionTypes.SET_SELECTED_GROUP_ID,
        selectedGroupId: groupId,
      }),
    [dispatch],
  );

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
    <div className="mt-8">
      {canManageGroups && isManagingGroups ? (
        <GroupManager category={groupCategory} groups={groups} />
      ) : (
        <>
          <CategoryCard
            canManageCategory={canManageCategory}
            canManageGroups={canManageGroups}
            category={groupCategory}
            numGroups={groups.length}
            onManageGroups={() => {
              dispatch({ type: actionTypes.MANAGE_GROUPS_START });
              window.scrollTo(0, 0);
            }}
          />
          {groups.map((group) => (
            <GroupTableCard
              key={group.id}
              canManageCategory={canManageCategory}
              group={group}
              onManageGroup={() => {
                dispatch({ type: actionTypes.MANAGE_GROUPS_START });
                handleGroupSelect(group.id);
              }}
            />
          ))}
          {groups.length === 0 ? (
            <Note message={<FormattedMessage {...translations.noGroups} />} />
          ) : null}
        </>
      )}
      <NotificationBar notification={notification} />
    </div>
  );
};

Category.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isManagingGroups: PropTypes.bool.isRequired,
  canManageCategory: PropTypes.bool.isRequired,
  canManageGroups: PropTypes.bool.isRequired,
  hasFetchError: PropTypes.bool.isRequired,
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
