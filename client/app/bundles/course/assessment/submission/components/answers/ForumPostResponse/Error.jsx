import React from 'react';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import PropTypes from 'prop-types';

const styles = {
  card: {
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 5,
  },
  header: {
    borderRadius: '5px 5px 0 0',
    padding: 12,
    backgroundColor: red[200],
    color: red[900],
  },
};

export default function Error({ message }) {
  return (
    <Card style={styles.card}>
      <CardHeader style={styles.header} title="Error" />
      <CardContent>{message}</CardContent>
    </Card>
  );
}

Error.propTypes = {
  message: PropTypes.string.isRequired,
};
