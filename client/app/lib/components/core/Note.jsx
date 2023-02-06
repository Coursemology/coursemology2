import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const translations = defineMessages({
  noteHeader: {
    id: 'lib.components.core.Note.noteHeader',
    defaultMessage: 'Note',
  },
});

const colorMap = {
  success: { bg: 'bg-green-200', text: 'text-green-600' },
  info: { bg: 'bg-orange-200', text: 'text-orange-600' },
};

const Note = ({ message, color = 'info' }) => (
  <Card className="my-5">
    <CardHeader
      className={`${colorMap[color].bg} p-5`}
      title={<FormattedMessage {...translations.noteHeader} />}
      titleTypographyProps={{
        variant: 'body2',
        className: `font-bold ${colorMap[color].text}`,
      }}
    />
    <CardContent className="p-5">
      <Typography variant="body2">{message}</Typography>
    </CardContent>
  </Card>
);

Note.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  color: PropTypes.string,
};

export default Note;
