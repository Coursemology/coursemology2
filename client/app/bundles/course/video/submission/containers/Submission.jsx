import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import VideoPlayer from './VideoPlayer';

function mapStateToProps({ video }) {
  return { video };
}

const propTypes = {
  video: PropTypes.object.isRequired,
};

class Submission extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTimestamp: 0,
    };
  }

  updateTimestamp = (newTimestamp) => {
    this.setState({ currentTimestamp: newTimestamp });
  };

  render() {
    const video = this.props.video;

    return (
      <div>
        <div>
          <VideoPlayer
            videoUrl={video.videoUrl}
            updateTimestamp={this.updateTimestamp}
          />
        </div>
      </div>
    );
  }
}

Submission.propTypes = propTypes;

export default connect(mapStateToProps)(Submission);
