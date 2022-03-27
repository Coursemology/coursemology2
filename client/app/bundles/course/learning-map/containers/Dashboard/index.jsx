import React, { useState } from 'react';
import { Card, CardText } from 'material-ui/Card';
import { connect } from 'react-redux';
import { green200, orange200, red200 } from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import { removeParentNode, toggleSatisfiabilityType } from 'course/learning-map/actions';
import ReactTooltip from 'react-tooltip';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';

const styles = {
  content: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    color: 'red',
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
    zIndex: 1000,
  },
};

const Dashboard = (props) => {
  const {
    dispatch,
    isLoading,
    nodes,
    response,
    selectedArrowId,
    selectedParentNodeId,
    selectedGateId,
  } = props;

  const [deleteArrowConfirmation, setDeleteArrowConfirmation] = useState(false);

  const deleteArrow = () => {
    setDeleteArrowConfirmation(false);

    if (selectedArrowId) {
      const arrowIdTokens = selectedArrowId.split('-to-');
      dispatch(removeParentNode(arrowIdTokens[0], arrowIdTokens[1]));
    }
  };

  const toggleNodeSatisfiabilityType = () => {
    if (selectedGateId) {
      const node = getNodeForSelectedGate();
      dispatch(toggleSatisfiabilityType(node.id));
    }
  };

  const responseDisplay = () => {
    return {
      color: response.didSucceed ? `${green200}` : `${red200}`,
      text: response.message,
    };
  };

  const getNodeForSelectedGate = () => {
    return nodes.find((node) => node.id === selectedGateId.split('-gate')[0]);
  };

  const selectedArrowDisplay = () => {
    const ids = selectedArrowId.split('-to-');
    const fromNodeTitle = nodes.find((node) => node.id === ids[0]).title;
    const toNodeTitle = nodes.find((node) => node.id === ids[1]).title;

    return {
      color: `${orange200}`,
      text: `Selected arrow: ${fromNodeTitle} ---> ${toNodeTitle}`,
    };
  };

  const selectedConditionNodeDisplay = () => {
    return {
      color: `${orange200}`,
      text: `Creating arrow from: ${nodes.find((node) => node.id === selectedParentNodeId).title}`,
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
    if (!(response
      && Object.keys(response).length === 0
      && Object.getPrototypeOf(response) === Object.prototype)) {
      return responseDisplay();
    }
    
    if (selectedArrowId) {
      return selectedArrowDisplay();
    }
    
    if (selectedParentNodeId) {
      return selectedConditionNodeDisplay();
    }
    if (selectedGateId) {
      return selectedGateDisplay();
    }

    return defaultDisplay();
  };

  const selectedArrowIcon = () => {
    const tooltipId = 'learning-map-dashboard-delete-arrow-icon-tooltip';

    return (
      <div
      data-tip
      data-for={tooltipId}>
      <FontIcon
        className={'fa fa-trash'}
        style={{...styles.icon}}
        onClick={() => setDeleteArrowConfirmation(true)}
      >
      </FontIcon>
      <ReactTooltip id={tooltipId}>
        Delete this arrow
      </ReactTooltip>
    </div>
    );
  };

  const selectedGateIcon = () => {
    const node = getNodeForSelectedGate();
    const tooltipId = 'learning-map-dashboard-toggle-satisfiability-type-icon-tooltip';

    return (
      <div
        data-tip
        data-for={tooltipId}>
        <FontIcon
          className={'fa fa-toggle-on'}
          style={styles.icon}
          onClick={() => toggleNodeSatisfiabilityType()}
        >
        </FontIcon>
        <ReactTooltip id={tooltipId}>
          Toggle satisfiability type to
            {` ${node.satisfiability_type === 'all_conditions' ? '\"at least one condition\"' : '\"all conditions\"'}`}
        </ReactTooltip>
      </div>
    );
  };

  const getActionIcons = () => {
    if (selectedArrowId) {
      return selectedArrowIcon();
    }

    if (selectedGateId) {
      return selectedGateIcon();
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
          { getActionIcons() }
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
  selectedArrowId: state.learningMap.selectedArrowId,
  selectedParentNodeId: state.learningMap.selectedParentNodeId,
  selectedGateId: state.learningMap.selectedGateId,
});

export default connect(mapStateToProps)(Dashboard);
