import React, { useState } from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import ConnectionPoint from '../ConnectionPoint';
import FontIcon from 'material-ui/FontIcon';
import { connect } from 'react-redux';
import UnlockRateDisplay from '../UnlockRateDisplay';
import { elementTypes } from '../../constants';
import NodeMenu from '../NodeMenu';

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
  unlockLevel: {
    cursor: 'pointer',
    fontSize: 12,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  wrapper: {
    border: '1px solid black',
    margin: 20,
    padding: 4,
    position: 'relative',
    width: 180,
  },
};

const icons = {
  achievement: 'fa fa-trophy',
  assessment: 'fa fa-plane',
  lock: 'fa fa-lock',
  material: 'fa fa-folder',
  survey: 'fa fa-pie-chart',
  video: 'fa fa-video-camera',
}

const Node = (props) => {
  const {
    canModify,
    getNodeConnectionPointId,
    node,
    selectedElement,
  } = props;

  const onConnectionPointClick = (event) => {
    event.stopPropagation();
    setIsNodeMenuDisplayed(true);
  };

  const [isNodeMenuDisplayed, setIsNodeMenuDisplayed] = useState(false);

  return (
    <>
      <Card
        id={node.id}
        style={{
          ...styles.wrapper,
          opacity: `${!canModify && !node.unlocked ? 0.2 : 1.0}`,
          zIndex: isNodeMenuDisplayed ? 999 : node.depth + 2
        }}
      >
        <CardHeader
          style={styles.header}
          textStyle={styles.headerText}
        >
          {
            node.unlock_level > 0 &&
            <>
              <div style={styles.unlockLevel}>
                Level {node.unlock_level}
              </div>
            </>
          }
          <FontIcon
            className={icons[node.course_material_type]}
            style={styles.icon}
          />
          {
            !canModify && !node.unlocked &&
            <>
              <FontIcon
                className={icons.lock}
                style={{...styles.icon, ...styles.lockIcon}}
              />
            </>
          }
        </CardHeader>
        <div style={styles.content}>
          <CardText style={styles.contentText}>
            <div>
              <a target='_blank' href={`${node.content_url}`}>
              {node.title}
              </a>
            </div>
            {
              canModify &&
              <UnlockRateDisplay
                nodeId={node.id}
                unlockRate={node.unlock_rate}
                width={0.6 * styles.wrapper.width}
              />
            }
          </CardText>
          <div style={styles.connectionPoint}>
            <ConnectionPoint
              id={getNodeConnectionPointId(node.id)}
              isActive={canModify}
              onClick={(event) => onConnectionPointClick(event, node.id)}
            />
            {
              isNodeMenuDisplayed &&
              <NodeMenu
                closeMenuCallback={() => setIsNodeMenuDisplayed(false)}
                parentNode={node}
              />
            }
          </div>
        </div>
      </Card>
    </>
  );
};

const mapStateToProps = (state) => ({
  canModify: state.learningMap.canModify,
  selectedElement: state.learningMap.selectedElement,
});

export default connect(mapStateToProps)(Node);
