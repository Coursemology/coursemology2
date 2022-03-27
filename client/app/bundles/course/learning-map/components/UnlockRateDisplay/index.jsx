import React from 'react';
import FontIcon from 'material-ui/FontIcon';
import ReactTooltip from 'react-tooltip';

const styles = {
  filledPortion: {
    backgroundColor: 'rgba(109, 242, 145)',
  },
  icon: {
    fontSize: '12px',
    margin: 'auto',
    padding: '0px',
  },
  unfilledPortion: {
    backgroundColor: 'white',
  },
  unlockRateBar: {
    border: '1px solid black',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    height: 12,
    margin: 'auto',
  },
};

const UnlockRateDisplay = (props) => {
  const {
    nodeId,
    unlockRate,
    width,
  } = props;

  return (
    <div>
      <FontIcon
        className={'fa fa-unlock'}
        style={styles.icon}
      />
      <div
        data-tip
        data-for={`${nodeId}-unlockBar`}
        style={{...styles.unlockRateBar, width: width}}
      >
        <div style={{... styles.filledPortion, width: unlockRate * width}}></div>
        <div style={{... styles.unfilledPortion, width: width - (unlockRate * width)}}></div>
      </div>
      <ReactTooltip
        id={`${nodeId}-unlockBar`}
        style={{zIndex: 9999}}
      >
        { `${(unlockRate * 100).toFixed(2)}% of students have unlocked this node` }
      </ReactTooltip>
    </div>
  );
};

export default UnlockRateDisplay;
