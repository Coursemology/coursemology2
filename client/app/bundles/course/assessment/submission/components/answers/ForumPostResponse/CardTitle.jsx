import { grey600 } from 'material-ui/styles/colors';
import React from 'react';
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

export default class CardTitle extends React.Component {
  render() {
    return (
      <div style={styles.cardTitle}>
        <div style={styles.typeLabel}>{this.props.type}</div>
        <div>{this.props.title}</div>
      </div>
    );
  }
}

CardTitle.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};
