import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ReadOnlyEditorComponent from '../components/ReadOnlyEditor';
import { TopicProp } from '../propTypes';

class ReadOnlyEditorContainer extends Component {
  static propTypes = {
    answerId: PropTypes.number.isRequired,
    fileId: PropTypes.number.isRequired,
    content: PropTypes.arrayOf(PropTypes.string),
    annotations: PropTypes.arrayOf(TopicProp),
  };

  render() {
    const { answerId, fileId, annotations, content } = this.props;
    return (
      <ReadOnlyEditorComponent
        answerId={answerId}
        fileId={fileId}
        annotations={annotations}
        content={content}
      />
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { fileId } = ownProps;
  return {
    annotations: state.annotations[fileId].topics,
  };
}

const ReadOnlyEditor = connect(
  mapStateToProps
)(ReadOnlyEditorContainer);
export default ReadOnlyEditor;
