import { Component } from 'react';
import { AddBox } from '@mui/icons-material';
import PropTypes from 'prop-types';

export default class AddCommentIcon extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.hovered !== this.props.hovered;
  }

  render() {
    const { hovered, onClick } = this.props;
    return (
      <div onClick={onClick}>
        <AddBox
          fontSize="small"
          style={{
            visibility: hovered ? 'visible' : 'hidden',
            alignItems: 'center',
            display: 'flex',
          }}
        />
      </div>
    );
  }
}

AddCommentIcon.propTypes = {
  onClick: PropTypes.func,
  hovered: PropTypes.bool,
};

AddCommentIcon.defaultProps = {
  onClick: () => {},
};
