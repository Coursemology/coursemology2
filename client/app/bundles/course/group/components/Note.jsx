import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardText } from 'material-ui';
import { orange900, orange200 } from 'material-ui/styles/colors';
import { defineMessages, FormattedMessage } from 'react-intl';

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

const translations = defineMessages({
  noteHeader: {
    id: 'course.group.noteHeader',
    defaultMessage: 'Note',
  },
});

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

export default Note;
