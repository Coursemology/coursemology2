import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { setItemSelectedBoolean } from 'course/duplication/actions';
import { videoTabShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';

const { VIDEO_TAB, VIDEO } = duplicableItemTypes;

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.VideosSelector.noItems',
    defaultMessage: 'There are no videos to duplicate.',
  },
});

class VideosSelector extends Component {
  setAllInTab = (tab) => (value) => {
    const { dispatch } = this.props;
    dispatch(setItemSelectedBoolean(VIDEO_TAB, tab.id, value));
    tab.videos.forEach((video) => {
      dispatch(setItemSelectedBoolean(VIDEO, video.id, value));
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
        <Subheader>
          <FormattedMessage {...translations.noItems} />
        </Subheader>
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
          label={
            <span>
              <TypeBadge itemType={VIDEO_TAB} />
              {title}
            </span>
          }
          indentLevel={0}
          onCheck={(e, value) =>
            dispatch(setItemSelectedBoolean(VIDEO_TAB, id, value))
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
        label={
          <span>
            <TypeBadge itemType={VIDEO} />
            {video.published || <UnpublishedIcon />}
            {video.title}
          </span>
        }
        checked={checked}
        indentLevel={1}
        onCheck={(e, value) =>
          dispatch(setItemSelectedBoolean(VIDEO, video.id, value))
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
        <h2>
          <FormattedMessage
            {...defaultComponentTitles.course_videos_component}
          />
        </h2>
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
