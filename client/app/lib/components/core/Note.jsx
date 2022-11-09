import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const translations = defineMessages({
  noteHeader: {
    id: 'course.group.noteHeader',
    defaultMessage: 'Note',
  },
});

const Note = ({ message }) => (
  <Card className="my-5">
    <CardHeader
      className="bg-orange-200 p-5"
      title={<FormattedMessage {...translations.noteHeader} />}
      titleTypographyProps={{
        variant: 'body2',
        className: 'font-bold text-orange-600',
      }}
    />
    <CardContent className="p-5">
      <Typography variant="body2">{message}</Typography>
    </CardContent>
  </Card>
);

Note.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

export default Note;
