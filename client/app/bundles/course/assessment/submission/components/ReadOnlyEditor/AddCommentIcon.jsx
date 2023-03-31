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
          className={`${hovered ? 'visible' : 'hidden'} flex items-center`}
          fontSize="small"
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
