import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

const translations = defineMessages({
  showAll: {
    id: 'lib.components.core.ExpandableText.showAll',
    defaultMessage: 'Show All',
  },
  showLess: {
    id: 'lib.components.core.ExpandableText.showLess',
    defaultMessage: 'Show Less',
  },
});

const propTypes = {
  text: PropTypes.string.isRequired,
  maxChars: PropTypes.number,
  intl: PropTypes.object.isRequired,
  style: PropTypes.object,
};

class ExpandableText extends Component {
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
  };

  handleShowLess = (e) => {
    e.preventDefault();
    this.setState({ expanded: false });
  };

  render() {
    const { text, maxChars, intl, style } = this.props;
    const showAll = intl.formatMessage(translations.showAll);
    const showLess = intl.formatMessage(translations.showLess);
    const maxLength =
      maxChars && maxChars > showAll.length ? maxChars : this.defaultMaxChars;

    if (text.length <= maxLength) {
      return <span style={style}>{text}</span>;
    }

    return (
      <span style={style}>
        {this.state.expanded
          ? text
          : `${text.substr(0, maxLength - showAll.length)}\u2026`}
        <br />
        {this.state.expanded ? (
          <a onClick={this.handleShowLess} role="button" tabIndex={0}>
            {showLess}
          </a>
        ) : (
          <a onClick={this.handleShowAll} role="button" tabIndex={0}>
            {showAll}
          </a>
        )}
      </span>
    );
  }
}

ExpandableText.propTypes = propTypes;

export default injectIntl(ExpandableText);
