import { Circle, Close } from '@mui/icons-material';
import { Chip, Paper, Typography } from '@mui/material';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import { select } from '../selectors';

interface ConnectionStatusProps {
  title: string;
  className?: string;
}

const ConnectionStatus = (props: ConnectionStatusProps): JSX.Element => {
  const { t } = useTranslation();
  const connected = useAppSelector(select('connected'));

  return (
    <Paper
      className={`space-y-3 p-5 ${props.className ?? ''}`}
      variant="outlined"
    >
      <Typography variant="body2">{props.title}</Typography>

      {connected ? (
        <Chip
          icon={<Circle className="animate-pulse" color="success" />}
          label={t(translations.connected)}
          size="small"
          variant="outlined"
        />
      ) : (
        <Chip
          icon={<Close color="error" />}
          label={t(translations.disconnected)}
          size="small"
          variant="outlined"
        />
      )}
    </Paper>
  );
};

export default ConnectionStatus;
