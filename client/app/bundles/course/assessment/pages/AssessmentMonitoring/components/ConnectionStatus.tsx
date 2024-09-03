import { Circle, Close } from '@mui/icons-material';
import { Chip, Paper, Typography } from '@mui/material';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation, { Translated } from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import { select } from '../selectors';
import { MonitoringState } from '../types';

interface ConnectionStatusProps {
  title: string;
  className?: string;
}

const CHIPS: Record<
  MonitoringState['status'],
  {
    icon: JSX.Element;
    getLabel: Translated<string>;
  }
> = {
  connecting: {
    icon: <LoadingIndicator bare className="p-1" size={18} />,
    getLabel: (t) => t(translations.connecting),
  },
  connected: {
    icon: <Circle className="animate-pulse" color="success" />,
    getLabel: (t) => t(translations.connected),
  },
  disconnected: {
    icon: <Close color="error" />,
    getLabel: (t) => t(translations.disconnected),
  },
};

const ConnectionStatus = (props: ConnectionStatusProps): JSX.Element => {
  const { t } = useTranslation();
  const status = useAppSelector(select('status'));
  const { icon, getLabel } = CHIPS[status];

  return (
    <Paper
      className={`space-y-3 p-5 ${props.className ?? ''}`}
      variant="outlined"
    >
      <Typography variant="body2">{props.title}</Typography>
      <Chip icon={icon} label={getLabel(t)} size="small" variant="outlined" />
    </Paper>
  );
};

export default ConnectionStatus;
