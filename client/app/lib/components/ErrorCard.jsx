import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui';
import { red200, red900 } from 'material-ui/styles/colors';
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
    backgroundColor: red200,
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
        titleColor={red900}
      />
      <CardText style={messageStyles}>{message}</CardText>
    </Card>
  );
}

Error.propTypes = {
  message: PropTypes.string.isRequired,
  cardStyles: PropTypes.object,
  headerStyles: PropTypes.object,
  messageStyles: PropTypes.object,
};
