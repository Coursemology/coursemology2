import React, { Component } from 'react';
import PropTypes from 'prop-types';

const tooltipStyle = {
  position: 'absolute',
  padding: '0 5px',
};

const tooltipInnerStyle = {
  marginLeft: 57,
  padding: '3px 8px',
  color: '#000',
  textAlign: 'center',
  borderRadius: 3,
  backgroundColor: '#FFF',
};

const tooltipArrowStyle = {
  position: 'absolute',
  width: 0,
  height: 0,
  borderRightColor: 'transparent',
  borderLeftColor: 'transparent',
  borderTopColor: 'transparent',
  borderBottomColor: 'transparent',
  borderStyle: 'solid',
};

const placementStyles = {
  left: {
    tooltip: { marginLeft: -3, padding: '0 5px' },
    arrow: { right: 0, marginTop: -5, borderWidth: '5px 0 5px 5px', borderLeftColor: '#FFF' },
  },
  bottom: {
    tooltip: { marginBottom: 3, padding: '5px 0' },
    arrow: { top: 0, marginLeft: -5, borderWidth: '0 5px 5px', borderBottomColor: '#FFF' },
  },
};

export default class OverlayTooltip extends Component {
  static propTypes = {
    style: PropTypes.object,            // eslint-disable-line react/forbid-prop-types
    placement: PropTypes.oneOf(['left', 'bottom']).isRequired,
    arrowOffsetLeft: PropTypes.string,
    arrowOffsetTop: PropTypes.string,
    children: PropTypes.node,
  };

  render() {
    const {
      style,
      placement,
      arrowOffsetLeft: left = placementStyles[placement].arrow.left,
      arrowOffsetTop: top = placementStyles[placement].arrow.top,
      children,
    } = this.props;

    return (
      <div style={{ ...tooltipStyle, ...placementStyles[placement].tooltip, ...style }}>
        <div style={{ ...tooltipArrowStyle, ...placementStyles[placement].arrow, left, top }} />
        <div style={tooltipInnerStyle}>
          {children}
        </div>
      </div>
    );
  }
}
