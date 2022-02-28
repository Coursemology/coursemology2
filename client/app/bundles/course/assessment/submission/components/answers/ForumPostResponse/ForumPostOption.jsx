import { Component } from 'react';
import { blueGrey, green, white } from '@material-ui/core/colors';

import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

import { postPackShape } from 'course/assessment/submission/propTypes';
import ForumPost, { translations } from 'course/forum/components/ForumPost';

import ParentPost from './ParentPost';

const styles = {
  general: {
    wordBreak: 'break-all',
    cursor: 'pointer',
    backgroundColor: white,
  },
  selected: {
    backgroundColor: green[50],
    borderColor: green[300],
    boxShadow: 'rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px',
  },
  unselected: {
    borderColor: blueGrey[200],
    boxShadow: 'none',
  },
};

/**
 * This is a wrapper around the general ForumPost component,
 * that provides "selectable" functionalities.
 */
class ForumPostOption extends Component {
  handleClick(event, postPack) {
    const { intl } = this.props;
    if (
      event.target.innerText === intl.formatMessage(translations.showMore) ||
      event.target.innerText === intl.formatMessage(translations.showLess)
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
          className="forum-post-option"
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
  intl: intlShape,
};

export default injectIntl(ForumPostOption);
