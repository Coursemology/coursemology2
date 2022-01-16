import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader, CardText } from 'material-ui';
import { orange200, orange900 } from 'material-ui/styles/colors';
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

const styles = {
  card: {
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 5,
  },
  cardHeader: {
    borderRadius: '5px 5px 0 0',
    padding: 12,
    backgroundColor: orange200,
    fontWeight: 'bold',
  },
};

const Note = ({ message }) => (
  <Card style={styles.card}>
    <CardHeader
      style={styles.cardHeader}
      title={<FormattedMessage {...translations.noteHeader} />}
      titleColor={orange900}
    />
    <CardText>{message}</CardText>
  </Card>
);

Note.propTypes = {
  message: PropTypes.string.isRequired,
};

const Category = ({
  dispatch,
  groupCategory,
  groupCategoryId,
  groups,
  isFetching,
  hasFetchError,
  notification,
}) => {
  useEffect(() => {
    dispatch(fetchGroupData(groupCategoryId));
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
  // Handles both null and undefined
  if (groupCategory == null) {
    return <Note message={<FormattedMessage {...translations.noCategory} />} />;
  }

  return (
    <>
      <CategoryHeader
        id={groupCategory.id}
        name={groupCategory.name}
        description={groupCategory.description}
        numGroups={groups.length}
      />
      {groups.map((group) => (
        <GroupTable key={group.id} group={group} />
      ))}
      {groups.length === 0 ? (
        <Note message={<FormattedMessage {...translations.noGroups} />} />
      ) : null}
      <NotificationBar notification={notification} />
    </>
  );
};

Category.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  hasFetchError: PropTypes.bool.isRequired,
  groupCategoryId: PropTypes.oneOf([PropTypes.string, PropTypes.number]),
  groupCategory: categoryShape,
  groups: PropTypes.arrayOf(groupShape).isRequired,
  dispatch: PropTypes.func.isRequired,
  notification: notificationShape,
};

export default connect(({ groupsFetch, notificationPopup }) => ({
  isFetching: groupsFetch.isFetching,
  hasFetchError: groupsFetch.hasFetchError,
  groupCategory: groupsFetch.groupCategory,
  groups: groupsFetch.groups,
  notification: notificationPopup,
}))(Category);
