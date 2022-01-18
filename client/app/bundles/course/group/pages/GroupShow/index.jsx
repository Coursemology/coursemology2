import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import ErrorCard from 'lib/components/ErrorCard';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import CategoryHeader from './CategoryHeader';
import GroupTable from './GroupTable';
import translations from './translations.intl';
import { categoryShape, groupShape } from '../../propTypes';
import { fetchGroupData } from '../../actions';
import GroupManager from './GroupManager';
import actionTypes from '../../constants';
import Note from '../../components/Note';

const Category = ({
  dispatch,
  groupCategory,
  groupCategoryId,
  groups,
  isFetching,
  isManagingGroups,
  hasFetchError,
  notification,
}) => {
  useEffect(() => {
    if (groupCategoryId) {
      dispatch(fetchGroupData(groupCategoryId));
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
      {isManagingGroups ? (
        <GroupManager category={groupCategory} groups={groups} />
      ) : (
        <>
          <CategoryHeader
            category={groupCategory}
            numGroups={groups.length}
            onManageGroups={() =>
              dispatch({ type: actionTypes.MANAGE_GROUPS_START })
            }
          />
          {groups.map((group) => (
            <GroupTable key={group.id} group={group} />
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
  notification: state.notificationPopup,
  isManagingGroups: state.groupsManage.isManagingGroups,
}))(Category);
