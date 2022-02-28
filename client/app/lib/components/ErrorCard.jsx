import React from 'react';
import { Card, CardHeader, CardContent } from '@material-ui/core';
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
  },
  headerTitle: {
    color: red[900],
    fontWeight: 'bold',
  },
};

export default function Error({
  message,
  cardStyles,
  headerStyles,
  messageStyles,
}) {
  return (
    <Card style={{ ...styles.card, ...cardStyles }}>
      <CardHeader
        style={{ ...styles.header, ...headerStyles }}
        title="Error"
        titleTypographyProps={{ variant: 'body2', style: styles.headerTitle }}
      />
      <CardContent style={messageStyles}>{message}</CardContent>
    </Card>
  );
}

Error.propTypes = {
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.node,
  ]).isRequired,
  cardStyles: PropTypes.object,
  headerStyles: PropTypes.object,
  messageStyles: PropTypes.object,
};
