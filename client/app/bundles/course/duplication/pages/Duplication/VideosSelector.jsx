import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import Checkbox from 'material-ui/Checkbox';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { setItemSelectedBoolean } from 'course/duplication/actions';
import { videoShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import BulkSelectors from 'course/duplication/components/BulkSelectors';

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.VideosSelector.noItems',
    defaultMessage: 'There are no videos to duplicate.',
  },
});

class VideosSelector extends React.Component {
  static propTypes = {
    videos: PropTypes.arrayOf(videoShape),
    selectedItems: PropTypes.shape({}),

    dispatch: PropTypes.func.isRequired,
  }

  setAllVideoSelection = (value) => {
    const { dispatch, videos } = this.props;

    videos.forEach((video) => {
      dispatch(setItemSelectedBoolean(duplicableItemTypes.VIDEO, video.id, value));
    });
  }

  renderRow(video) {
    const { dispatch, selectedItems } = this.props;
    const checked = !!selectedItems[duplicableItemTypes.VIDEO][video.id];

    return (
      <Checkbox
        key={video.id}
        label={
          <span>
            <TypeBadge itemType={duplicableItemTypes.VIDEO} />
            { video.published || <UnpublishedIcon /> }
            { video.title }
          </span>
        }
        checked={checked}
        onCheck={(e, value) =>
          dispatch(setItemSelectedBoolean(duplicableItemTypes.VIDEO, video.id, value))
        }
      />
    );
  }

  render() {
    const { videos } = this.props;
    if (!videos) { return null; }

    return (
      <div>
        <h2><FormattedMessage {...defaultComponentTitles.course_videos_component} /></h2>
        <BulkSelectors
          callback={this.setAllVideoSelection}
          styles={{ selectLink: { marginLeft: 0 } }}
        />
        {
          videos.length > 0 ?
          videos.map(video => this.renderRow(video)) :
          <Subheader>
            <FormattedMessage {...translations.noItems} />
          </Subheader>
        }
      </div>
    );
  }
}

export default connect(({ duplication }) => ({
  videos: duplication.videosComponent,
  selectedItems: duplication.selectedItems,
}))(VideosSelector);
