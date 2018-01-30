import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'material-ui/Toggle';

const styles = {
  toggle: {
    zIndex: 1,
  },
};

class PublishedCell extends React.PureComponent {
  static propTypes = {
    published: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
  }

  render() {
    const { published, onToggle } = this.props;
    return (
      <td>
        <Toggle
          toggled={published}
          onToggle={onToggle}
          inputStyle={styles.toggle}
        />
      </td>
    );
  }
}


export default PublishedCell;
