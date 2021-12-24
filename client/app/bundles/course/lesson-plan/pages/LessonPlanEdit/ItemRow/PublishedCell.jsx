import PropTypes from 'prop-types';
import Toggle from 'material-ui/Toggle';

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
        toggled={published}
        onToggle={onToggle}
        inputStyle={styles.toggle}
      />
    </td>
  );
};

PublishedCell.propTypes = {
  published: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default PublishedCell;
