import { grey600 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

const styles = {
  cardTitle: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  typeLabel: {
    color: grey600,
    fontSize: 12,
    marginBottom: -3,
  },
};

const CardTitle = ({ type, title }) => (
  <div style={styles.cardTitle}>
    <div style={styles.typeLabel}>{type}</div>
    <div>{title}</div>
  </div>
);

export default CardTitle;

CardTitle.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.object.isRequired,
};
