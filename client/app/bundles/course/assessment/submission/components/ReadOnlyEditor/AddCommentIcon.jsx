import React, { Component } from 'react';

export default class AddCommentIcon extends Component {
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
    return (
      <div onMouseOver={() => this.onMouseOver()} onMouseOut={() => this.onMouseOut()}>
        <i className="fa fa-plus-square" style={{ visibility: hovered ? 'visible' : 'hidden' }} />
      </div>
    );
  }
}
