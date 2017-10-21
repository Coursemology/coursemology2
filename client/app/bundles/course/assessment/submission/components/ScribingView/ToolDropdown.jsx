import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FontIcon from 'material-ui/FontIcon';
import MaterialTooltip from 'material-ui/internal/Tooltip';
import { blue500 } from 'material-ui/styles/colors';

const propTypes = {
  toolType: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  showTooltip: PropTypes.bool,
  currentTool: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  onClickIcon: PropTypes.func,
  onClickChevron: PropTypes.func,
  colorBarBorder: PropTypes.string,
  colorBarBackground: PropTypes.string,
  iconClassname: PropTypes.string,
  iconComponent: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

const style = {
  tool: {
    position: 'relative',
    display: 'inline-block',
    paddingRight: '24px',
    outline: 'none',
  },
  innerTool: {
    display: 'inline-block',
    outline: 'none',
  },
  colorBar: {
    width: '23px',
    height: '8px',
  },
  chevron: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: '12px',
    padding: '10px 0px 10px 0px',
  },
};

export default class ToolDropdown extends Component {
  renderIcon() {
    const { iconClassname, currentTool, toolType, iconComponent } = this.props;

    return iconComponent ?
      iconComponent() :
      <FontIcon
        className={iconClassname}
        style={
          currentTool === toolType ?
            { color: blue500 } :
            { color: 'rgba(0, 0, 0, 0.4)' }
        }
      />;
  }

  renderColorBar() {
    const { colorBarBorder, colorBarBackground } = this.props;

    const backgroundColor = colorBarBackground;
    const borderColor = colorBarBorder;

    return (
      <div
        style={{
          width: '23px',
          height: '8px',
          backgroundColor,
          border: borderColor ? `${borderColor} 2px solid` : undefined,
        }}
      />
    );
  }

  render() {
    const {
      onClick, onClickIcon, onClickChevron,
      tooltip, showTooltip, onMouseEnter, onMouseLeave,
    } = this.props;

    return (
      <div
        role="button"
        tabIndex="0"
        style={style.tool}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div role="button" tabIndex="0" style={style.innerTool} onClick={onClickIcon}>
          { this.renderIcon() }
          <MaterialTooltip
            horizontalPosition={'center'}
            label={tooltip}
            show={showTooltip}
            verticalPosition={'top'}
          />
          { this.renderColorBar() }
        </div>
        <div style={style.innerTool}>
          <FontIcon
            className="fa fa-chevron-down"
            style={style.chevron}
            onClick={onClickChevron}
          />
        </div>
      </div>
    );
  }
}

ToolDropdown.propTypes = propTypes;
