import { CSSProperties, ReactNode } from 'react';
import { Typography } from '@mui/material';
import { InfoOutlined as InfoIcon, Warning as WarningIcon } from '@mui/icons-material';

interface InfoLabelProps {
  label?: string;
  children?: ReactNode;
  warning?: boolean;
  marginTop?: number;
}

const styles: { [key: string]: CSSProperties } = {
  infoLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  infoLabelIcon: {
    marginRight: 0.5,
  },
};

const InfoLabel = (props: InfoLabelProps): JSX.Element => {
  return (
    <Box
      sx={styles.infoLabel}
      marginTop={props.marginTop}
      color={props.warning ? 'warning.main' : 'text.secondary'}
    >
      {props.warning ? (
        <WarningIcon sx={styles.infoLabelIcon} />
      ) : (
        <InfoIcon sx={styles.infoLabelIcon} />
      )}

      <Typography variant="body2">{props.label}</Typography>

      {props.children}
    </Typography>
  );
};

export default InfoLabel;
