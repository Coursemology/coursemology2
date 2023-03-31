import { Component } from 'react';
import { ExpandMore } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { blue } from '@mui/material/colors';
import PropTypes from 'prop-types';

const propTypes = {
  activeObject: PropTypes.object,
  disabled: PropTypes.bool,
  toolType: PropTypes.string.isRequired,
  tooltip: PropTypes.node,
  currentTool: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  onClickIcon: PropTypes.func,
  onClickChevron: PropTypes.func,
  colorBarBorder: PropTypes.string,
  colorBarBackground: PropTypes.string,
  iconComponent: PropTypes.object,
};

const style = {
  tool: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    outline: 'none',
  },
  innerTool: {
    textAlign: 'center',
    display: 'inline-block',
    outline: 'none',
  },
  chevron: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: '16px',
    padding: '0px',
  },
  disabled: {
    cursor: 'not-allowed',
    pointerEvents: 'none',
    color: '#c0c0c0',
  },
};

export default class ToolDropdown extends Component {
  renderColorBar() {
    const { activeObject, disabled, colorBarBorder, colorBarBackground } =
      this.props;

    let backgroundColor = colorBarBackground;
    let borderColor = colorBarBorder;

    if (activeObject) {
      switch (activeObject.type) {
        case 'path':
        case 'line':
          backgroundColor = activeObject.stroke;
          break;
        case 'i-text':
          backgroundColor = activeObject.fill;
          break;
        case 'rect':
        case 'ellipse':
          backgroundColor = activeObject.fill;
          borderColor = activeObject.stroke;
          break;
        default:
      }
    }

    const colorBarStyle = disabled
      ? {
          width: '30px',
          height: '5px',
          background: '#c0c0c0',
        }
      : {
          width: '30px',
          height: '5px',
          backgroundColor,
          border: borderColor ? `${borderColor} 2px solid` : undefined,
        };

    return <div style={colorBarStyle} />;
  }

  renderIcon() {
    const {
      disabled,
      currentTool,
      toolType,
      iconComponent: IconComponent,
    } = this.props;
    const iconStyle = disabled
      ? style.disabled
      : { color: currentTool === toolType ? blue[500] : 'rgba(0, 0, 0, 0.4)' };
    return <IconComponent style={iconStyle} />;
  }

  render() {
    const { disabled, onClick, onClickIcon, onClickChevron, tooltip } =
      this.props;

    return (
      <Tooltip placement="top" title={tooltip}>
        <div
          onClick={(event) => (disabled ? () => {} : onClick && onClick(event))}
          role="button"
          style={disabled ? { ...style.tool, ...style.disabled } : style.tool}
          tabIndex="0"
        >
          <div
            onClick={onClickIcon}
            role="button"
            style={style.innerTool}
            tabIndex="0"
          >
            {this.renderIcon()}
            {this.renderColorBar()}
          </div>
          <div style={style.innerTool}>
            <IconButton
              onClick={!disabled ? onClickChevron : undefined}
              style={
                disabled
                  ? { ...style.chevron, ...style.disabled }
                  : style.chevron
              }
            >
              <ExpandMore fontSize="medium" />
            </IconButton>
          </div>
        </div>
      </Tooltip>
    );
  }
}

ToolDropdown.propTypes = propTypes;
