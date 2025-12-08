import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { ListSubheader, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { videoTabShape } from 'course/duplication/propTypes';
import { actions } from 'course/duplication/store';
import componentTranslations from 'course/translations';

const { VIDEO_TAB, VIDEO } = duplicableItemTypes;

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.VideosSelector.noItems',
    defaultMessage: 'There are no videos to duplicate.',
  },
});

class VideosSelector extends Component {
  setAllInTab = (tab) => (value) => {
    const { dispatch } = this.props;
    dispatch(actions.setItemSelectedBoolean(VIDEO_TAB, tab.id, value));
    tab.videos.forEach((video) => {
      dispatch(actions.setItemSelectedBoolean(VIDEO, video.id, value));
    });
  };

  setEverything = (value) => {
    const { tabs } = this.props;
    tabs.forEach((tab) => this.setAllInTab(tab)(value));
  };

  renderBody() {
    const { tabs } = this.props;

    if (tabs.length < 1) {
      return (
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.noItems} />
        </ListSubheader>
      );
    }

    return (
      <>
        {tabs.length > 1 ? (
          <BulkSelectors
            callback={this.setEverything}
            styles={{ selectLink: { marginLeft: 0 } }}
          />
        ) : null}
        {tabs.map((tab) => this.renderTabTree(tab))}
      </>
    );
  }

  renderTabTree(tab) {
    const { dispatch, selectedItems } = this.props;
    const { id, title, videos } = tab;
    const checked = !!selectedItems[VIDEO_TAB][id];

    return (
      <div key={id}>
        <IndentedCheckbox
          checked={checked}
          indentLevel={0}
          label={
            <span>
              <TypeBadge itemType={VIDEO_TAB} />
              {title}
            </span>
          }
          onChange={(e, value) =>
            dispatch(actions.setItemSelectedBoolean(VIDEO_TAB, id, value))
          }
        >
          <BulkSelectors callback={this.setAllInTab(tab)} />
        </IndentedCheckbox>
        {videos.map((video) => this.renderVideo(video))}
      </div>
    );
  }

  renderVideo(video) {
    const { dispatch, selectedItems } = this.props;
    const checked = !!selectedItems[VIDEO][video.id];

    return (
      <IndentedCheckbox
        key={video.id}
        checked={checked}
        indentLevel={1}
        label={
          <span style={{ display: 'flex', alignItems: 'centre' }}>
            <TypeBadge itemType={VIDEO} />
            {video.published || <UnpublishedIcon />}
            {video.title}
          </span>
        }
        onChange={(e, value) =>
          dispatch(actions.setItemSelectedBoolean(VIDEO, video.id, value))
        }
      />
    );
  }

  render() {
    const { tabs } = this.props;
    if (!tabs) {
      return null;
    }

    return (
      <>
        <Typography className="mt-5 mb-5" variant="h2">
          <FormattedMessage
            {...componentTranslations.course_videos_component}
          />
        </Typography>
        {this.renderBody()}
      </>
    );
  }
}

VideosSelector.propTypes = {
  tabs: PropTypes.arrayOf(videoTabShape),
  selectedItems: PropTypes.shape({}),

  dispatch: PropTypes.func.isRequired,
};

export default connect(({ duplication }) => ({
  tabs: duplication.videosComponent,
  selectedItems: duplication.selectedItems,
}))(VideosSelector);
