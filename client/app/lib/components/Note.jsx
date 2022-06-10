import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, Typography } from '@mui/material';
import { orange } from '@mui/material/colors';
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
    backgroundColor: orange[200],
  },
  cardHeaderTitle: {
    color: orange[900],
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
      titleTypographyProps={{ variant: 'body2', style: styles.cardHeaderTitle }}
    />
    <CardContent>
      <Typography variant="body2">{message}</Typography>
    </CardContent>
  </Card>
);

Note.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

export default Note;
