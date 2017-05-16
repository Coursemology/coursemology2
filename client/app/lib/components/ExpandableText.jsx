import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';

const translations = defineMessages({
  showAll: {
    id: 'lib.ExpandableText.showAll',
    defaultMessage: 'Show All',
  },
  showLess: {
    id: 'lib.ExpandableText.showLess',
    defaultMessage: 'Show Less',
  },
});

const propTypes = {
  text: PropTypes.string.isRequired,
  maxChars: PropTypes.number,
  intl: intlShape.isRequired,
};

class ExpandableText extends React.Component {
  constructor(props) {
    super(props);

    this.defaultMaxChars = 140;
    this.state = {
      expanded: false,
    };
  }

  handleShowAll = (e) => {
    e.preventDefault();
    this.setState({ expanded: true });
  }

  handleShowLess = (e) => {
    e.preventDefault();
    this.setState({ expanded: false });
  }

  render() {
    const { text, maxChars, intl } = this.props;
    const showAll = intl.formatMessage(translations.showAll);
    const showLess = intl.formatMessage(translations.showLess);
    const maxLength = maxChars && maxChars > showAll.length ? maxChars : this.defaultMaxChars;

    if (text.length <= maxLength) {
      return <span>{ text }</span>;
    }

    return (
      <span>
        { this.state.expanded ?
          text :
          `${text.substr(0, maxLength - showAll.length)}\u2026`
        }
        <br />
        { this.state.expanded ?
          <a role="button" tabIndex={0} onClick={this.handleShowLess}>{showLess}</a> :
          <a role="button" tabIndex={0} onClick={this.handleShowAll}>{showAll}</a>
        }
      </span>
    );
  }
}

ExpandableText.propTypes = propTypes;

export default injectIntl(ExpandableText);
