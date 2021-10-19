import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';
import { postPackShape } from 'course/assessment/submission/propTypes';
import ForumPost from 'course/forum/components/ForumPost';
import ParentPost from './ParentPost';

const styles = {
  row: {
    display: 'table-row',
    border: '3px solid #fff',
    width: '100%',
  },
  cellCheckbox: {
    display: 'table-cell',
    width: '42px',
    margin: 0,
    padding: 0,
  },
  cellPost: {
    display: 'table-cell',
    width: '1000px',
  },
  checkbox: {
    margin: 0,
    padding: 0,
  },
};

export default class Option extends React.Component {
  render() {
    const { postPack } = this.props;
    return (
      <div style={styles.row}>
        <div style={styles.cellCheckbox}>
          <Checkbox
            style={styles.checkbox}
            checked={this.props.isSelected}
            onClick={() => {
              this.props.onSelectPostPack(postPack, this.props.isSelected);
            }}
          />
        </div>
        <div style={styles.cellPost}>
          <ForumPost
            post={postPack.corePost}
            asmSubStatus={this.props.isSelected}
            isExpandable
          />
          {postPack.parentPost && <ParentPost post={postPack.parentPost} />}
          <br />
        </div>
      </div>
    );
  }
}

Option.propTypes = {
  postPack: postPackShape,
  isSelected: PropTypes.bool,
  onSelectPostPack: PropTypes.func,
};
