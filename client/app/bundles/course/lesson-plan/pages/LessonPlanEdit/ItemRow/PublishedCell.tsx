import { ChangeEvent } from 'react';
import { Switch } from '@mui/material';

const styles = {
  toggle: {
    zIndex: 1,
  },
};

interface PublishedCellProps {
  published: boolean;
  onToggle: (event: ChangeEvent<HTMLInputElement>, isToggled: boolean) => void;
  disabled?: boolean;
}

const PublishedCell = (props: PublishedCellProps): JSX.Element => {
  const { published, onToggle, disabled } = props;

  return (
    <td>
      <Switch
        checked={published}
        color="primary"
        disabled={disabled}
        onChange={onToggle}
        style={styles.toggle}
      />
    </td>
  );
};

export default PublishedCell;
