import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Cancel } from '@mui/icons-material';
import { ListItemText, ListSubheader, MenuItem, MenuList } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';

import { addParentNode } from 'course/learning-map/operations';

import { nodeShape, relatedNodeShape } from '../../propTypes';
import translations from '../../translations';

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
  },
};

const NodeMenu = (props) => {
  const { dispatch, nodes, onCloseMenu, parentNode } = props;

  const onClickMenuItem = (selectedNode) => {
    onCloseMenu();
    dispatch(addParentNode(parentNode.id, selectedNode.id));
  };

  return (
    <ThemeProvider theme={theme}>
      <MenuList style={styles.wrapper}>
        <ListSubheader inset={false} style={styles.header}>
          <FormattedMessage {...translations.addCondition} />
          <Cancel onClick={onCloseMenu} style={styles.closeIcon} />
        </ListSubheader>
        {nodes.map((node) => (
          <MenuItem
            key={`${node.id}-list-item`}
            onClick={() => onClickMenuItem(node)}
          >
            <ListItemText>{node.title}</ListItemText>
          </MenuItem>
        ))}
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
