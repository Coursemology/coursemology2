import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import { Card, CardText } from 'material-ui/Card';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { videoTabShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';

const { VIDEO_TAB, VIDEO } = duplicableItemTypes;

const translations = defineMessages({
  defaultTab: {
    id: 'course.duplication.VideoListing.defaultTab',
    defaultMessage: 'Default Tab',
  },
});

class VideoListing extends Component {
  static renderDefaultTabRow() {
    return (
      <IndentedCheckbox
        disabled
        indentLevel={0}
        label={<FormattedMessage {...translations.defaultTab} />}
      />
    );
  }

  static renderTab(tab) {
    return (
      <div key={tab.id}>
        {VideoListing.renderTabRow(tab)}
        {tab.videos.map(VideoListing.renderVideoRow)}
      </div>
    );
  }

  static renderTabRow(tab) {
    return (
      <IndentedCheckbox
        checked
        indentLevel={0}
        label={
          <span>
            <TypeBadge itemType={VIDEO_TAB} />
            {tab.title}
          </span>
        }
      />
    );
  }

  static renderVideoRow(video) {
    return (
      <IndentedCheckbox
        checked
        key={video.id}
        indentLevel={1}
        label={
          <span>
            <TypeBadge itemType={VIDEO} />
            <UnpublishedIcon tooltipId="itemUnpublished" />
            {video.title}
          </span>
        }
      />
    );
  }

  selectedSubtrees() {
    const { tabs, selectedItems } = this.props;
    const tabTrees = [];
    const orphanedVideos = [];

    tabs.forEach((tab) => {
      const selectedVideos = tab.videos.filter(
        (video) => selectedItems[VIDEO][video.id],
      );

      if (selectedItems[VIDEO_TAB][tab.id]) {
        tabTrees.push({ ...tab, videos: selectedVideos });
      } else {
        orphanedVideos.push(...selectedVideos);
      }
    });

    return [tabTrees, orphanedVideos];
  }

  render() {
    const [tabTrees, orphanedVideos] = this.selectedSubtrees();
    if (tabTrees.length + orphanedVideos.length < 1) {
      return null;
    }

    return (
      <>
        <Subheader>
          <FormattedMessage
            {...defaultComponentTitles.course_videos_component}
          />
        </Subheader>
        <Card>
          <CardText>
            {tabTrees.map(VideoListing.renderTab)}
            <div key="default">
              {orphanedVideos.length > 0 && VideoListing.renderDefaultTabRow()}
              {orphanedVideos.map(VideoListing.renderVideoRow)}
            </div>
          </CardText>
        </Card>
      </>
    );
  }
}

VideoListing.propTypes = {
  tabs: PropTypes.arrayOf(videoTabShape),
  selectedItems: PropTypes.shape({}),
};

export default connect(({ duplication }) => ({
  tabs: duplication.videosComponent,
  selectedItems: duplication.selectedItems,
}))(VideoListing);
