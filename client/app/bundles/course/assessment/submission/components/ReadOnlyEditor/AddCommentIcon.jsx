import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AddCommentIcon extends Component {
  static propTypes = {
    onClick: PropTypes.func,
  };

  static defaultProps = {
    onClick: () => {},
  };

  constructor(props) {
    super(props);
    this.state = { hovered: false };
  }

  onMouseOver() {
    this.setState({ hovered: true });
  }

  onMouseOut() {
    this.setState({ hovered: false });
  }

  render() {
    const { hovered } = this.state;
    const { onClick } = this.props;
    return (
      <div onClick={onClick} onMouseOver={() => this.onMouseOver()} onMouseOut={() => this.onMouseOut()}>
        <i className="fa fa-plus-square" style={{ visibility: hovered ? 'visible' : 'hidden' }} />
      </div>
    );
  }
}
