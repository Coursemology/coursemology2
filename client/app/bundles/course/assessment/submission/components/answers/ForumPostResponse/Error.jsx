import { Card, CardContent, CardHeader } from '@mui/material';
import { red } from '@mui/material/colors';
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
    backgroundColor: red[200],
    color: red[900],
  },
};

const Error = ({ message }) => (
  <Card style={styles.card}>
    <CardHeader style={styles.header} title="Error" />
    <CardContent>{message}</CardContent>
  </Card>
);

Error.propTypes = {
  message: PropTypes.string.isRequired,
};

export default Error;
