import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
  RaisedButton,
} from 'material-ui';

const styles = {
  title: {
    fontWeight: 'bold',
    marginTop: '0.5rem',
    marginBottom: 0,
  },
  text: {
    paddingTop: 0,
  },
  actions: {
    padding: 16,
  },
};

const CategoryHeader = ({ name, description, numGroups }) => {
  const onClickEdit = () => {
    // TODO: Redirect to category edit page
  };

  return (
    <Card>
      <CardHeader
        title={<h3 style={styles.title}>{name}</h3>}
        subtitle={`${numGroups} groups`}
      />
      <CardText style={styles.text}>
        {description ?? 'No description available.'}
      </CardText>
      <CardActions style={styles.actions}>
        <RaisedButton
          primary
          label="Manage Category and Groups"
          onClick={onClickEdit}
        />
      </CardActions>
    </Card>
  );
};

CategoryHeader.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  numGroups: PropTypes.number.isRequired,
};

export default CategoryHeader;
