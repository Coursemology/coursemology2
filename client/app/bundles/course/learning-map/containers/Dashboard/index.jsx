import React, { useState } from 'react';
import { Card, CardText } from 'material-ui/Card';
import { connect } from 'react-redux';
import { green200, orange200, red200 } from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import { removeParentNode, resetSelection, toggleSatisfiabilityType } from 'course/learning-map/actions';
import ReactTooltip from 'react-tooltip';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { elementTypes } from '../../constants';

const styles = {
  content: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    cursor: 'pointer',
    fontSize: '18px',
    marginLeft: '20px',
    padding: '0px',
  },
  refreshIndicator: {
    position: 'relative',
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
      color: response.didSucceed ? `${green200}` : `${red200}`,
      text: response.message,
    };
  };

  const selectedArrowDisplay = () => {
    const ids = selectedElement.id.split('-to-');
    const fromNodeTitle = nodes.find((node) => node.id === ids[0]).title;
    const toNodeTitle = nodes.find((node) => node.id === ids[1]).title;

    return {
      color: `${orange200}`,
      text: `Selected arrow: ${fromNodeTitle} ---> ${toNodeTitle}`,
    };
  };

  const selectedGateDisplay = () => {
    return {
      color: `${orange200}`,
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
        <FontIcon
          className={'fa fa-trash'}
          data-tip
          data-for={tooltipId}
          style={{...styles.icon, color: 'red'}}
          onClick={() => setDeleteArrowConfirmation(true)}
        />
        <ReactTooltip id={tooltipId}>
          Delete this arrow
        </ReactTooltip>
      </>
    );
  };

  const selectedGateIcon = () => {
    const node = getNodeForSelectedGate();
    const tooltipId = 'learning-map-dashboard-toggle-satisfiability-type-icon-tooltip';

    return (
      <>
        <FontIcon
          className={'fa fa-toggle-on'}
          data-tip
          data-for={tooltipId}
          style={styles.icon}
          onClick={() => toggleNodeSatisfiabilityType()}
        >
        </FontIcon>
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
        <CardText style={styles.content}>
          { text }
          { getActionElements() }
          {
            (!isEmptyResponse || selectedElement.type) &&
            <FontIcon
              className={'fa fa-window-close'}
              style={{...styles.icon}}
              onClick={() => reset()}
            />
          }
          { isLoading &&
            <RefreshIndicator
              top={0}
              left={20}
              size={30}
              status='loading'
              style={styles.refreshIndicator}
            />
          }
        </CardText>
      </Card>
      <ConfirmationDialog
        confirmDelete
        open={deleteArrowConfirmation}
        message={'Are you sure that you want to delete this arrow?'}
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
