import { useState } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { Card, CardContent, CircularProgress, Icon } from '@mui/material';
import { green, orange, red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import {
  removeParentNode,
  resetSelection,
  toggleSatisfiabilityType,
} from 'course/learning-map/actions';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

import { elementTypes, satisfiabilityTypes } from '../../constants';
import {
  nodeShape,
  responseShape,
  selectedElementShape,
} from '../../propTypes';
import translations from '../../translations.intl';

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
  const { dispatch, intl, isLoading, nodes, response, selectedElement } = props;

  const [deleteArrowConfirmation, setDeleteArrowConfirmation] = useState(false);
  const isEmptyResponse =
    response &&
    Object.keys(response).length === 0 &&
    Object.getPrototypeOf(response) === Object.prototype;

  const deleteArrow = () => {
    setDeleteArrowConfirmation(false);

    if (selectedElement.type === elementTypes.arrow) {
      const arrowIdTokens = selectedElement.id.split('-to-');
      dispatch(removeParentNode(arrowIdTokens[0], arrowIdTokens[1]));
    }
  };

  const getNodeForSelectedGate = () =>
    nodes.find((node) => node.id === selectedElement.id.split('-gate')[0]);

  const toggleNodeSatisfiabilityType = () => {
    if (selectedElement.type === elementTypes.gate) {
      const node = getNodeForSelectedGate();
      dispatch(toggleSatisfiabilityType(node.id));
    }
  };

  const reset = () => {
    dispatch(resetSelection());
  };

  const responseDisplay = () => ({
    color: response.didSucceed ? green[300] : red[200],
    text: (
      <FormattedMessage
        {...translations.responseDashboardMessage}
        values={{ responseMessage: response.message }}
      />
    ),
  });

  const selectedArrowDisplay = () => {
    const ids = selectedElement.id.split('-to-');
    const fromNodeTitle = nodes.find((node) => node.id === ids[0]).title;
    const toNodeTitle = nodes.find((node) => node.id === ids[1]).title;

    return {
      color: orange[400],
      text: (
        <FormattedMessage
          {...translations.selectedArrowDashboardMessage}
          values={{ fromNode: fromNodeTitle, toNode: toNodeTitle }}
        />
      ),
    };
  };

  const selectedGateDisplay = () => ({
    color: orange[400],
    text: (
      <FormattedMessage
        {...translations.selectedGateDashboardMessage}
        values={{ node: getNodeForSelectedGate().title }}
      />
    ),
  });

  const defaultDisplay = () => ({
    color: 'white',
    text: <FormattedMessage {...translations.defaultDashboardMessage} />,
  });

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
          className="fa fa-trash"
          data-for={tooltipId}
          data-tip={true}
          onClick={() => setDeleteArrowConfirmation(true)}
          style={{ ...styles.icon, color: 'red' }}
        />
        <ReactTooltip id={tooltipId}>
          <FormattedMessage {...translations.deleteCondition} />
        </ReactTooltip>
      </>
    );
  };

  const selectedGateIcon = () => {
    const node = getNodeForSelectedGate();
    const tooltipId =
      'learning-map-dashboard-toggle-satisfiability-type-icon-tooltip';

    return (
      <>
        <Icon
          className="fa fa-toggle-on"
          data-for={tooltipId}
          data-tip={true}
          onClick={() => toggleNodeSatisfiabilityType()}
          style={styles.icon}
        />
        <ReactTooltip id={tooltipId}>
          <FormattedMessage
            {...translations.toggleSatisfiabilityType}
            values={{
              satisfiabilityType:
                node.satisfiabilityType === satisfiabilityTypes.allConditions
                  ? '"at least one condition"'
                  : '"all conditions"',
            }}
          />
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
          return null;
      }
    }

    return null;
  };

  const { color, text } = getDisplay();

  return (
    <>
      <Card style={{ ...styles.wrapper, backgroundColor: color }}>
        <CardContent style={styles.content}>
          {text}
          {getActionElements()}
          {(!isEmptyResponse || selectedElement.type) && (
            <Icon
              className="fa fa-window-close"
              onClick={() => reset()}
              style={{ ...styles.icon }}
            />
          )}
          {isLoading && (
            <CircularProgress size={30} style={styles.circularProgress} />
          )}
        </CardContent>
      </Card>
      <ConfirmationDialog
        confirmDelete={true}
        message={intl.formatMessage(translations.conditionDeletionConfirmation)}
        onCancel={() => setDeleteArrowConfirmation(false)}
        onConfirm={() => deleteArrow()}
        open={deleteArrowConfirmation}
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

Dashboard.propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  nodes: PropTypes.arrayOf(nodeShape).isRequired,
  response: responseShape.isRequired,
  selectedElement: selectedElementShape.isRequired,
};

export default connect(mapStateToProps)(injectIntl(Dashboard));
