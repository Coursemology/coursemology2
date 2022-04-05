import { useState } from 'react';
import { Card, CardContent, Icon } from '@mui/material';
import { connect } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import ConnectionPoint from '../ConnectionPoint';
import UnlockRateDisplay from '../UnlockRateDisplay';
import NodeMenu from '../NodeMenu';
import translations from '../../translations.intl';
import { nodeShape } from '../../propTypes';

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
  icon: {
    fontSize: 12,
    padding: '0px',
  },
  lockIcon: {
    marginLeft: 4,
    opacity: 1.0,
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

const icons = {
  achievement: 'fa fa-trophy',
  assessment: 'fa fa-plane',
  lock: 'fa fa-lock',
  material: 'fa fa-folder',
  survey: 'fa fa-pie-chart',
  video: 'fa fa-video-camera',
};

const Node = (props) => {
  const { canModify, getNodeConnectionPointId, node } = props;

  const [isNodeMenuDisplayed, setIsNodeMenuDisplayed] = useState(false);
  const zIndex = isNodeMenuDisplayed ? 999 : node.depth + 2;

  const onConnectionPointClick = (event) => {
    event.stopPropagation();
    setIsNodeMenuDisplayed(true);
  };

  return (
    <>
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
              {node.unlock_level > 0 && (
                <>
                  <div style={styles.unlockLevel}>
                    <FormattedMessage
                      {...translations.unlockLevel}
                      values={{ unlockLevel: node.unlock_level }}
                    />
                  </div>
                </>
              )}
              <Icon
                className={icons[node.course_material_type]}
                style={styles.icon}
              />
              {!canModify && !node.unlocked && (
                <>
                  <Icon
                    className={icons.lock}
                    style={{ ...styles.icon, ...styles.lockIcon }}
                  />
                </>
              )}
            </CardContent>
            <div style={styles.content}>
              <CardContent style={styles.contentText}>
                <div>
                  <a
                    target="_blank"
                    href={`${node.content_url}`}
                    rel="noreferrer"
                  >
                    {node.title}
                  </a>
                </div>
                {canModify && (
                  <UnlockRateDisplay
                    nodeId={node.id}
                    unlockRate={node.unlock_rate}
                    width={0.6 * styles.wrapper.width}
                  />
                )}
              </CardContent>
              <div style={styles.connectionPoint}>
                <ConnectionPoint
                  id={getNodeConnectionPointId(node.id)}
                  isActive={canModify}
                  onClick={(event) => onConnectionPointClick(event, node.id)}
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
    </>
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
