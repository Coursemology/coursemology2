import { useCallback, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';

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
  canManageCategory,
  canManageGroups,
}) => {
  const { groupCategoryId } = useParams();
  const handleGroupSelect = useCallback(
    (groupId) => {
      dispatch({ type: actionTypes.MANAGE_GROUPS_START });
      dispatch({
        type: actionTypes.SET_SELECTED_GROUP_ID,
        selectedGroupId: groupId,
      });
    },
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
      <Note
        message={<FormattedMessage {...translations.fetchFailure} />}
        severity="error"
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
            onManageGroups={() =>
              dispatch({ type: actionTypes.MANAGE_GROUPS_START })
            }
          />
          {groups.map((group) => (
            <GroupTableCard
              key={group.id}
              canManageCategory={canManageCategory}
              group={group}
              onManageGroup={() => handleGroupSelect(group.id)}
            />
          ))}
          {groups.length === 0 ? (
            <Note message={<FormattedMessage {...translations.noGroups} />} />
          ) : null}
        </>
      )}
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
};

export default connect(({ groups }) => ({
  isFetching: groups.groupsFetch.isFetching,
  hasFetchError: groups.groupsFetch.hasFetchError,
  groupCategory: groups.groupsFetch.groupCategory,
  groups: groups.groupsFetch.groups,
  canManageCategory: groups.groupsFetch.canManageCategory,
  canManageGroups: groups.groupsFetch.canManageGroups,
  isManagingGroups: groups.groupsManage.isManagingGroups,
}))(Category);
