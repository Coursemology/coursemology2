import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import ConnectionPoint from '../ConnectionPoint';
import FontIcon from 'material-ui/FontIcon';
import { connect } from 'react-redux';
import { selectParentNode } from 'course/learning-map/actions';
import ReactTooltip from 'react-tooltip';
import UnlockRateDisplay from '../UnlockRateDisplay';
import { elementTypes } from '../../constants';

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
    cursor: 'pointer',
    fontSize: '12px',
    padding: '0px',
  },
  wrapper: {
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

const iconTooltips = {
  achievement: 'Achievement',
  assessment: 'Assessment',
  lock: 'Locked',
  material: 'File',
  survey: 'Survey',
  video: 'Video',
}

const Node = (props) => {
  const {
    canModify,
    dispatch,
    getNodeConnectionPointId,
    node,
    selectedElement,
  } = props;

  const onConnectionPointClick = (event) => {
    event.stopPropagation();
    dispatch(selectParentNode(node.id))
  };

  return (
    <>
      <Card
        id={node.id}
        style={{...styles.wrapper, border: '1px solid black', opacity: `${!canModify && !node.unlocked ? 0.2 : 1.0}`, zIndex: node.depth + 2 }}
      >
        <CardHeader
          style={styles.header}
          textStyle={styles.headerText}
        >
          {
            node.unlock_level > 0 &&
            <>
              <div
                data-tip
                data-for={`${node.id}-unlock-level`}
                style={{cursor: 'pointer', position: 'absolute', top: 0, left: 0}}>
                L{node.unlock_level}
              </div>
              <ReactTooltip id={`${node.id}-unlock-level`}>
                { `Additional unlock criteria: Reach level ${node.unlock_level}` }
              </ReactTooltip>
            </>
          }
          <FontIcon
            className={icons[node.course_material_type]}
            data-tip
            data-for={`${node.id}-type-icon`}
            style={styles.icon}
          />
          <ReactTooltip id={`${node.id}-type-icon`}>
            { iconTooltips[node.course_material_type] }
          </ReactTooltip>
          {
            !canModify && !node.unlocked &&
            <>
              <FontIcon
                className={icons.lock}
                data-tip
                data-for={`${node.id}-lock-icon`}
                style={{...styles.icon, marginLeft: 4, opacity: 1.0}}
              />
              <ReactTooltip id={`${node.id}-lock-icon`}>
                { iconTooltips.lock }
              </ReactTooltip>
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
              isActive={canModify && selectedElement.type !== elementTypes.parentNode}
              onClick={(event) => onConnectionPointClick(event, node.id)}
              zIndex={'inherit'}
            />
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
