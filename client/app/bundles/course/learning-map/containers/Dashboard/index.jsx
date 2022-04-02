import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CircularProgress,
  Icon,
} from '@mui/material';
import { connect } from 'react-redux';
import { removeParentNode, resetSelection, toggleSatisfiabilityType } from 'course/learning-map/actions';
import ReactTooltip from 'react-tooltip';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { elementTypes } from '../../constants';

const red = '#f08080';
const orange = '#ffa500';
const green = '#00ff7f';

const styles = {
  content: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  circularProgress: {
    marginLeft: 12,
    position: 'relative',
  },
  icon: {
    cursor: 'pointer',
    fontSize: '18px',
    marginLeft: '20px',
    padding: '0px',
  },
  wrapper: {
    bottom: 0,
    position: 'sticky',
    textAlign: 'center',
    zIndex: 999,
  },
};

const Dashboard = (props) => {
  const {
    dispatch,
    isLoading,
    nodes,
    response,
    selectedElement,
  } = props;

  const [deleteArrowConfirmation, setDeleteArrowConfirmation] = useState(false);
  const isEmptyResponse = (
    response
    && Object.keys(response).length === 0
    && Object.getPrototypeOf(response) === Object.prototype
  );

  const deleteArrow = () => {
    setDeleteArrowConfirmation(false);

    if (selectedElement.type === elementTypes.arrow) {
      const arrowIdTokens = selectedElement.id.split('-to-');
      dispatch(removeParentNode(arrowIdTokens[0], arrowIdTokens[1]));
    }
  };

  const toggleNodeSatisfiabilityType = () => {
    if (selectedElement.type === elementTypes.gate) {
      const node = getNodeForSelectedGate();
      dispatch(toggleSatisfiabilityType(node.id));
    }
  };

  const getNodeForSelectedGate = () => {
    return nodes.find((node) => node.id === selectedElement.id.split('-gate')[0]);
  };

  const reset = () => {
    dispatch(resetSelection());
  };

  const responseDisplay = () => {
    return {
      color: response.didSucceed ? `${green}` : `${red}`,
      text: response.message,
    };
  };

  const selectedArrowDisplay = () => {
    const ids = selectedElement.id.split('-to-');
    const fromNodeTitle = nodes.find((node) => node.id === ids[0]).title;
    const toNodeTitle = nodes.find((node) => node.id === ids[1]).title;

    return {
      color: `${orange}`,
      text: `Selected condition: ${fromNodeTitle} ---> ${toNodeTitle}`,
    };
  };

  const selectedGateDisplay = () => {
    return {
      color: `${orange}`,
      text: `Selected gate for: ${getNodeForSelectedGate().title}`,
    };
  };

  const defaultDisplay = () => {
    return {
      color: 'white',
      text: 'Learning Map',
    };
  };

  const getDisplay = () => {
    if (!isEmptyResponse) {
      return responseDisplay();
    }

    switch (selectedElement.type) {
      case elementTypes.arrow:
        return selectedArrowDisplay();
      case elementTypes.gate:
        return selectedGateDisplay();
      default:
        return defaultDisplay();
    }
  };

  const selectedArrowIcon = () => {
    const tooltipId = 'learning-map-dashboard-delete-arrow-icon-tooltip';

    return (
      <>
        <Icon
          className={'fa fa-trash'}
          data-tip
          data-for={tooltipId}
          style={{...styles.icon, color: 'red'}}
          onClick={() => setDeleteArrowConfirmation(true)}
        />
        <ReactTooltip id={tooltipId}>
          Delete this condition
        </ReactTooltip>
      </>
    );
  };

  const selectedGateIcon = () => {
    const node = getNodeForSelectedGate();
    const tooltipId = 'learning-map-dashboard-toggle-satisfiability-type-icon-tooltip';

    return (
      <>
        <Icon
          className={'fa fa-toggle-on'}
          data-tip
          data-for={tooltipId}
          style={styles.icon}
          onClick={() => toggleNodeSatisfiabilityType()}
        >
        </Icon>
        <ReactTooltip id={tooltipId}>
          Toggle satisfiability type to
            {` ${node.satisfiability_type === 'all_conditions' ? '\"at least one condition\"' : '\"all conditions\"'}`}
        </ReactTooltip>
      </>
    );
  };

  const getActionElements = () => {
    if (selectedElement.type) {
      switch (selectedElement.type) {
        case elementTypes.arrow:
          return selectedArrowIcon();
        case elementTypes.gate:
          return selectedGateIcon();
        default:
          return <></>
      }
    }

    return <></>
  };

  const {
    color,
    text,
  } = getDisplay();

  return (
    <>
      <Card style={{...styles.wrapper, backgroundColor: color}}>
        <CardContent style={styles.content}>
          { text }
          { getActionElements() }
          {
            (!isEmptyResponse || selectedElement.type) &&
            <Icon
              className={'fa fa-window-close'}
              style={{...styles.icon}}
              onClick={() => reset()}
            />
          }
          { isLoading &&
            <CircularProgress
              size={30}
              style={styles.circularProgress}
            />
          }
        </CardContent>
      </Card>
      <ConfirmationDialog
        confirmDelete
        open={deleteArrowConfirmation}
        message={'Are you sure that you want to delete this condition?'}
        onCancel={() => setDeleteArrowConfirmation(false)}
        onConfirm={() => deleteArrow()}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  isLoading: state.learningMap.isLoading,
  nodes: state.learningMap.nodes,
  response: state.learningMap.response,
  selectedElement: state.learningMap.selectedElement,
});

export default connect(mapStateToProps)(Dashboard);
