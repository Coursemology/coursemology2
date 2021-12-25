import Toggle from 'material-ui/Toggle';
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
      <Toggle
        inputStyle={styles.toggle}
        onToggle={onToggle}
        toggled={published}
      />
    </td>
  );
};

PublishedCell.propTypes = {
  published: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default PublishedCell;
