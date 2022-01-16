import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader, CardText } from 'material-ui';
import { orange200, orange900 } from 'material-ui/styles/colors';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import ErrorCard from 'lib/components/ErrorCard';
import CategoryHeader from './CategoryHeader';
import GroupTable from './GroupTable';
import { categoryShape, groupShape } from '../../propTypes';
import { fetchGroupData } from '../../actions';
import { errorMessages } from '../../constants';

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
    <CardHeader style={styles.cardHeader} title="Note" titleColor={orange900} />
    <CardText>{message}</CardText>
  </Card>
);

Note.propTypes = {
  message: PropTypes.string.isRequired,
};

const Category = ({
  dispatch,
  groupCategory,
  groups,
  isFetching,
  hasFetchError,
}) => {
  useEffect(() => {
    dispatch(fetchGroupData());
  }, []);

  if (isFetching) {
    return <LoadingIndicator />;
  }
  if (hasFetchError) {
    return <ErrorCard message={errorMessages.fetchFailure} />;
  }
  // Handles both null and undefined
  if (groupCategory == null) {
    return (
      <Note message="You don't have a group category created! Create one now!" />
    );
  }

  return (
    <div>
      <CategoryHeader
        name={groupCategory.name}
        description={groupCategory.description}
        numGroups={groups.length}
      />
      {groups.map((group) => (
        <GroupTable key={group.id} group={group} />
      ))}
      {groups.length === 0 ? (
        <Note
          message={
            "You don't have any groups under this category! " +
            'Start managing this category and its groups now to get started!'
          }
        />
      ) : null}
    </div>
  );
};

Category.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  hasFetchError: PropTypes.bool.isRequired,
  groupCategory: categoryShape,
  groups: PropTypes.arrayOf(groupShape).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ groupsFetch }) => ({
  isFetching: groupsFetch.isFetching,
  hasFetchError: groupsFetch.hasFetchError,
  groupCategory: groupsFetch.groupCategory,
  groups: groupsFetch.groups,
}))(Category);
