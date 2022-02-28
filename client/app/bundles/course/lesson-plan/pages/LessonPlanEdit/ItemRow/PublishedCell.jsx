import PropTypes from 'prop-types';
import { Switch } from '@material-ui/core';

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
