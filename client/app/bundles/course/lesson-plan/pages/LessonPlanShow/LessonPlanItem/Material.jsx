import React from 'react';
import PropTypes from 'prop-types';
import Description from 'material-ui/svg-icons/action/description';
import { grey700 } from 'material-ui/styles/colors';

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

class Material extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }

  render() {
    const { name, url } = this.props;
    return (
      <div style={styles.material}>
        <Description style={styles.icon} color={grey700} />
        <a href={url}>{ name }</a>
      </div>
    );
  }
}

export default Material;
