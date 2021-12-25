import { grey700 } from 'material-ui/styles/colors';
import Description from 'material-ui/svg-icons/action/description';
import PropTypes from 'prop-types';

const styles = {
  material: {
    position: 'relative',
    paddingTop: 10,
    paddingLeft: 35,
  },
  icon: {
    height: 20,
    width: 20,
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    margin: 10,
  },
};

const Material = (props) => {
  const { name, url } = props;
  return (
    <div style={styles.material}>
      <Description color={grey700} style={styles.icon} />
      <a href={url}>{name}</a>
    </div>
  );
};

Material.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

export default Material;
