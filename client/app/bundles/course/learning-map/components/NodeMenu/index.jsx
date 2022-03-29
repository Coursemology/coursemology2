import React from 'react';
import { connect } from 'react-redux';
import { Menu, MenuItem } from 'material-ui/Menu';
import Subheader from 'material-ui/Subheader';
import { FontIcon } from 'material-ui';
import { addParentNode } from 'course/learning-map/actions';

const styles = {
  closeIcon: {
    cursor: 'pointer',
    fontSize: 16,
    marginRight: 4,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  wrapper: {
    backgroundColor: 'white',
    border: '1px solid grey',
    left: -10,
    position: 'absolute',
    top: -10,
  }
};

const NodeMenu = (props) => {
  const {
    closeMenuCallback,
    dispatch,
    nodes,
    parentNode,
  } = props;

  const onClickMenuItem = (selectedNode) => {
    closeMenuCallback();
    dispatch(addParentNode(parentNode.id, selectedNode.id));
  }

  return (
    <Menu
      maxHeight={256}
      style={styles.wrapper}
      width={32}
    >
      <Subheader
        inset={false}
        style={styles.header}
      >
        <div>
          Add condition to:
        </div>
        <FontIcon
          className='fa fa-window-close'
          onClick={() => closeMenuCallback()}
          style={styles.closeIcon}
        />
      </Subheader>
      {
        nodes.map((node) => {
          return (
            <MenuItem
              key={`${node.id}-list-item`}
              onClick={() => onClickMenuItem(node)}
              primaryText={node.title}
            />
          )
        })
      }
    </Menu>
  );
};

const mapStateToProps = (state) => ({
  nodes: state.learningMap.nodes,
});

export default connect(mapStateToProps)(NodeMenu);
