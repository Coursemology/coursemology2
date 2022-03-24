import { Card, CardContent, CardHeader } from '@mui/material';
import { red } from '@mui/material/colors';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

const translations = defineMessages({
  error: {
    id: 'course.assessment.submission.answer.forumPostResponse.error',
    defaultMessage: 'Error',
  },
});

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
      <CardHeader
        style={styles.header}
        title={<FormattedMessage {...translations.error} />}
      />
      <CardContent>{message}</CardContent>
    </Card>
  );
}

Error.propTypes = {
  message: PropTypes.string.isRequired,
};
