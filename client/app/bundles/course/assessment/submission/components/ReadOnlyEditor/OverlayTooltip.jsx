import React, { Component } from 'react';
import PropTypes from 'prop-types';

const TooltipStyle = {
  position: 'absolute',
  padding: '0 5px',
};

const TooltipInnerStyle = {
  marginLeft: 57,
  padding: '3px 8px',
  color: '#000',
  textAlign: 'center',
  borderRadius: 3,
  backgroundColor: '#FFF',
};

const TooltipArrowStyle = {
  position: 'absolute',
  width: 0,
  height: 0,
  borderRightColor: 'transparent',
  borderLeftColor: 'transparent',
  borderTopColor: 'transparent',
  borderBottomColor: 'transparent',
  borderStyle: 'solid',
};

const PlacementStyle = {
  tooltip: { marginBottom: 3, padding: '5px 0' },
  arrow: { top: 0, marginLeft: -5, borderWidth: '0 5px 5px', borderBottomColor: '#FFF' },
};

export default class OverlayTooltip extends Component {
  static propTypes = {
    style: PropTypes.object,            // eslint-disable-line react/forbid-prop-types
    arrowOffsetLeft: PropTypes.string,
    arrowOffsetTop: PropTypes.string,
    children: PropTypes.node,
  };

  render() {
    const {
      style,
      arrowOffsetLeft: left = PlacementStyle.arrow.left,
      arrowOffsetTop: top = PlacementStyle.arrow.top,
      children,
    } = this.props;

    return (
      <div style={{ ...TooltipStyle, ...PlacementStyle.tooltip, ...style }}>
        <div style={{ ...TooltipArrowStyle, ...PlacementStyle.arrow, left, top }} />
        <div style={TooltipInnerStyle}>
          {children}
        </div>
      </div>
    );
  }
}
