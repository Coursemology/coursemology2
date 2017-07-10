import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AnnotationProp } from '../propTypes';

class VisiblePostPreview extends Component {
  render() {
    const { style, creator, text } = this.props;
    return (
      <div style={style}>
        {`${creator}: ${text}`}
      </div>
    );
  }
}

VisiblePostPreview.propTypes = {
  style: PropTypes.object,                  // eslint-disable-line react/forbid-prop-types
  annotation: AnnotationProp.isRequired,    // eslint-disable-line react/no-unused-prop-types
  creator: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

VisiblePostPreview.defaultProps = {
  style: {},
};

function mapStateToProps(state, ownProps) {
  const { annotation } = ownProps;
  if (annotation.postIds.length > 0) {
    return {
      creator: state.posts[annotation.postIds[0]].creator.name,
      text: state.posts[annotation.postIds[0]].text,
    };
  }
  return {
    creator: '',
    text: '',
  };
}

const PostPreview = connect(mapStateToProps)(VisiblePostPreview);
export default PostPreview;
