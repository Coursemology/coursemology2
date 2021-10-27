import { Card, CardHeader, CardText } from 'material-ui';
import { red200, red900 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

const styles = {
  card: {
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 5,
  },
  header: {
    borderRadius: '5px 5px 0 0',
    padding: 12,
    backgroundColor: red200,
  },
};

export default function Error({ message }) {
  return (
    <Card style={styles.card}>
      <CardHeader style={styles.header} title="Error" titleColor={red900} />
      <CardText>{message}</CardText>
    </Card>
  );
}

Error.propTypes = {
  message: PropTypes.string.isRequired,
};
