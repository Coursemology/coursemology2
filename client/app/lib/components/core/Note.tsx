import { FC, ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  noteHeader: {
    id: 'lib.components.core.Note.noteHeader',
    defaultMessage: 'Note',
  },
  errorHeader: {
    id: 'lib.components.core.Note.errorHeader',
    defaultMessage: 'Error',
  },
});

type NoteSeverity = 'success' | 'warning' | 'error';

const NoteSeverityMapper = {
  success: { bg: 'bg-green-200', text: 'text-green-600' },
  warning: { bg: 'bg-orange-200', text: 'text-orange-600' },
  error: { bg: 'bg-red-200', text: 'text-red-900' },
};

const Note: FC<{ message: string | ReactNode; severity?: NoteSeverity }> = (
  props,
) => {
  const { t } = useTranslation();
  const severity = props.severity ?? 'warning';

  return (
    <Card className="m-5">
      <CardHeader
        className={`${NoteSeverityMapper[severity].bg} p-5`}
        title={
          severity === 'error'
            ? t(translations.errorHeader)
            : t(translations.noteHeader)
        }
        titleTypographyProps={{
          variant: 'body2',
          className: `font-bold ${NoteSeverityMapper[severity].text}`,
        }}
      />
      <CardContent className="p-5">
        <Typography variant="body2">{props.message}</Typography>
      </CardContent>
    </Card>
  );
};

export default Note;
