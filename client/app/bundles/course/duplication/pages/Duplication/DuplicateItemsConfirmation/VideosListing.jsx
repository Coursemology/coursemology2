import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Checkbox from 'material-ui/Checkbox';
import Subheader from 'material-ui/Subheader';
import { Card, CardText } from 'material-ui/Card';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { videoShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';

class VideoListing extends React.Component {
  static propTypes = {
    videos: PropTypes.arrayOf(videoShape),
    selectedItems: PropTypes.shape({}),
  }

  static renderRow(video) {
    return (
      <Checkbox
        checked
        key={video.id}
        label={
          <span>
            <TypeBadge itemType={duplicableItemTypes.VIDEO} />
            <UnpublishedIcon tooltipId="itemUnpublished" />
            { video.title }
          </span>
        }
      />
    );
  }

  selectedVideos() {
    const { videos, selectedItems } = this.props;
    return videos ? videos.filter(video => selectedItems[duplicableItemTypes.VIDEO][video.id]) : [];
  }

  render() {
    const selectedVideos = this.selectedVideos();
    if (selectedVideos.length < 1) { return null; }

    return (
      <React.Fragment>
        <Subheader>
          <FormattedMessage {...defaultComponentTitles.course_videos_component} />
        </Subheader>
        <Card>
          <CardText>
            { selectedVideos.map(VideoListing.renderRow) }
          </CardText>
        </Card>
      </React.Fragment>
    );
  }
}

export default connect(({ duplication }) => ({
  videos: duplication.videosComponent,
  selectedItems: duplication.selectedItems,
}))(VideoListing);
