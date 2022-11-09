import { Switch } from '@mui/material';
import PropTypes from 'prop-types';

const styles = {
  toggle: {
    zIndex: 1,
  },
};

const PublishedCell = (props) => {
  const { published, onToggle } = props;
  return (
    <td>
      <Switch
        checked={published}
        color="primary"
        onChange={onToggle}
        style={styles.toggle}
      />
    </td>
  );
};

PublishedCell.propTypes = {
  published: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default PublishedCell;
