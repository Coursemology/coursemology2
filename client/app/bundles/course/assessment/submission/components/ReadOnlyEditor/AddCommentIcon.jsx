import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AddCommentIcon extends Component {
  static propTypes = {
    onClick: PropTypes.func,
  };

  static defaultProps = {
    onClick: () => {},
  };

  shouldComponentUpdate(nextProps) {
    return nextProps.hovered !== this.props.hovered;
  }

  render() {
    const { hovered, onClick } = this.props;
    return (
      <div onClick={onClick}>
        <i className="fa fa-plus-square" style={{ visibility: hovered ? 'visible' : 'hidden' }} />
      </div>
    );
  }
}
