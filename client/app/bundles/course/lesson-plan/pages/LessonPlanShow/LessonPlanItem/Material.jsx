import PropTypes from 'prop-types';
import Description from '@material-ui/icons/Description';
import { grey } from '@mui/material/colors';

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
      <Description style={styles.icon} htmlColor={grey[700]} />
      <a href={url}>{name}</a>
    </div>
  );
};

Material.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

export default Material;
