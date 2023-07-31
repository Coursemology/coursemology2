import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Lock } from '@mui/icons-material';
import { Card, CardContent } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';

import Link from 'lib/components/core/Link';
import { defensivelyGetIcon } from 'lib/constants/icons';

import { nodeShape } from '../../propTypes';
import translations from '../../translations';
import ConnectionPoint from '../ConnectionPoint';
import NodeMenu from '../NodeMenu';
import UnlockRateDisplay from '../UnlockRateDisplay';

// Allows NodeMenu to overflow the Card MUI component (i.e. the Node)
const theme = createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'visible',
        },
      },
    },
  },
});

const styles = {
  connectionPoint: {
    position: 'absolute',
    right: '2.5%',
  },
  content: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  contentText: {
    flexGrow: 1,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center-top',
    display: 'flex',
    justifyContent: 'center',
    padding: 0,
    width: '100%',
  },
  headerText: {
    padding: 0,
    position: 'absolute',
  },
  node: {
    border: '1px solid black',
    padding: 4,
    position: 'relative',
    width: 180,
  },
  unlockLevel: {
    cursor: 'pointer',
    fontSize: 12,
    left: 0,
    marginLeft: 4,
    position: 'absolute',
    top: 0,
  },
  wrapper: {
    backgroundColor: 'white',
    width: 180,
    margin: 20,
  },
};

const Node = (props) => {
  const { canModify, getNodeConnectionPointId, node } = props;

  const [isNodeMenuDisplayed, setIsNodeMenuDisplayed] = useState(false);
  const zIndex = isNodeMenuDisplayed ? 999 : node.depth + 2;

  const onConnectionPointClick = (event) => {
    event.stopPropagation();
    setIsNodeMenuDisplayed(true);
  };

  const Icon = defensivelyGetIcon(node.courseMaterialType);

  return (
    <div style={{ ...styles.wrapper, zIndex }}>
      <ThemeProvider theme={theme}>
        <Card
          id={node.id}
          style={{
            ...styles.node,
            opacity: `${!canModify && !node.unlocked ? 0.2 : 1.0}`,
            zIndex,
          }}
        >
          <CardContent style={styles.header}>
            {node.unlockLevel > 0 && (
              <div style={styles.unlockLevel}>
                <FormattedMessage
                  {...translations.unlockLevel}
                  values={{ unlockLevel: node.unlockLevel }}
                />
              </div>
            )}
            <Icon style={styles.icon} />
            {!canModify && !node.unlocked && <Lock />}
          </CardContent>
          <div style={styles.content}>
            <CardContent style={styles.contentText}>
              <div>
                <Link opensInNewTab to={node.contentUrl}>
                  {node.title}
                </Link>
              </div>
              {canModify && (
                <UnlockRateDisplay
                  nodeId={node.id}
                  unlockRate={node.unlockRate}
                  width={0.6 * styles.wrapper.width}
                />
              )}
            </CardContent>
            <div style={styles.connectionPoint}>
              <ConnectionPoint
                id={getNodeConnectionPointId(node.id)}
                isActive={canModify}
                onClick={(event) => onConnectionPointClick(event)}
              />
              {isNodeMenuDisplayed && (
                <NodeMenu
                  onCloseMenu={() => setIsNodeMenuDisplayed(false)}
                  parentNode={node}
                />
              )}
            </div>
          </div>
        </Card>
      </ThemeProvider>
    </div>
  );
};

const mapStateToProps = (state) => ({
  canModify: state.learningMap.canModify,
  selectedElement: state.learningMap.selectedElement,
});

Node.propTypes = {
  canModify: PropTypes.bool.isRequired,
  getNodeConnectionPointId: PropTypes.func.isRequired,
  node: nodeShape.isRequired,
};

export default connect(mapStateToProps)(Node);
