import React from 'react';
import { connect } from 'react-redux';
import {
  Icon,
  ListItemText,
  ListSubheader,
  MenuList,
  MenuItem,
} from '@mui/material';
import { addParentNode } from 'course/learning-map/actions';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Remove padding from top of MenuList
const theme = createTheme({
  components: {
    MuiList: {
      styleOverrides: {
        root: {
          paddingTop: 0,
        },
      },
    },
  },
});

const styles = {
  closeIcon: {
    cursor: 'pointer',
    fontSize: 16,
    marginTop: 4,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  wrapper: {
    backgroundColor: 'white',
    border: '1px solid black',
    left: -10,
    maxHeight: 240,
    overflow: 'auto',
    position: 'absolute',
    top: -10,
    width: 300,
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
    <ThemeProvider theme={theme}>
      <MenuList style={styles.wrapper}>
        <ListSubheader
          inset={false}
          style={styles.header}
        >
          Add condition to:
          <Icon
            className='fa fa-window-close'
            onClick={() => closeMenuCallback()}
            style={styles.closeIcon}
          />
        </ListSubheader>
        {
          nodes.map((node) => {
            return (
              <MenuItem
                key={`${node.id}-list-item`}
                onClick={() => onClickMenuItem(node)}
              >
                <ListItemText>{node.title}</ListItemText>
              </MenuItem>
            )
          })
        }
      </MenuList>
    </ThemeProvider>
  );
};

const mapStateToProps = (state) => ({
  nodes: state.learningMap.nodes,
});

export default connect(mapStateToProps)(NodeMenu);
