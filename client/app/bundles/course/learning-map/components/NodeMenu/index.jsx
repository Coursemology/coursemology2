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
import {
  createTheme,
  ThemeProvider,
} from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import translations from '../../translations.intl';
import PropTypes from 'prop-types';
import {
  nodeShape,
  relatedNodeShape,
} from '../../propTypes';

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
    dispatch,
    nodes,
    onCloseMenu,
    parentNode,
  } = props;

  const onClickMenuItem = (selectedNode) => {
    onCloseMenu();
    dispatch(addParentNode(parentNode.id, selectedNode.id));
  }

  console.log(nodes);

  return (
    <ThemeProvider theme={theme}>
      <MenuList style={styles.wrapper}>
        <ListSubheader
          inset={false}
          style={styles.header}
        >
          <FormattedMessage {...translations.addCondition} />
          <Icon
            className='fa fa-window-close'
            onClick={() => onCloseMenu()}
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

NodeMenu.propTypes = {
  dispatch: PropTypes.func.isRequired,
  nodes: PropTypes.arrayOf(nodeShape).isRequired,
  onCloseMenu: PropTypes.func.isRequired,
  parentNode: relatedNodeShape,
};

export default connect(mapStateToProps)(NodeMenu);
