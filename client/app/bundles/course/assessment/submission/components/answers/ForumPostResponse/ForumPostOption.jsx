import React from 'react';
import PropTypes from 'prop-types';
import {
  white,
  blueGrey200,
  green50,
  green300,
} from 'material-ui/styles/colors';

import { postPackShape } from 'course/assessment/submission/propTypes';
import ForumPost from 'course/forum/components/ForumPost';

import ParentPost from './ParentPost';

const styles = {
  general: {
    wordBreak: 'break-all',
    cursor: 'pointer',
    backgroundColor: white,
  },
  selected: {
    backgroundColor: green50,
    borderColor: green300,
    boxShadow: 'rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px',
  },
  unselected: {
    borderColor: blueGrey200,
    boxShadow: 'none',
  },
};

/**
 * This is a wrapper around the general ForumPost component,
 * that provides "selectable" functionalities.
 */
export default class ForumPostOption extends React.Component {
  handleClick(event, postPack) {
    if (
      event.target.innerText === 'SHOW MORE' ||
      event.target.innerText === 'SHOW LESS'
    ) {
      return;
    }
    this.props.onSelectPostPack(postPack, this.props.isSelected);
  }

  render() {
    const { postPack } = this.props;
    const postStyles = {
      ...styles.general,
      ...(this.props.isSelected ? styles.selected : styles.unselected),
    };

    return (
      <div style={this.props.style}>
        <div
          onClick={(event) => {
            event.persist();
            this.handleClick(event, postPack);
          }}
        >
          <ForumPost post={postPack.corePost} isExpandable style={postStyles} />
        </div>
        {postPack.parentPost && <ParentPost post={postPack.parentPost} />}
      </div>
    );
  }
}

ForumPostOption.propTypes = {
  postPack: postPackShape.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelectPostPack: PropTypes.func.isRequired,
  style: PropTypes.object,
};
