import React from 'react';
import { Divider, Card, CardHeader, CardText, FlatButton } from 'material-ui';
import PropTypes from 'prop-types';
import moment from 'lib/moment';
import { defineMessages, FormattedMessage } from 'react-intl';

const MAX_POST_HEIGHT = 60;

export const translations = defineMessages({
  showMore: {
    id: 'course.forum.forumPost.showMore',
    defaultMessage: 'SHOW MORE',
  },
  showLess: {
    id: 'course.forum.forumPost.showLess',
    defaultMessage: 'SHOW LESS',
  },
});

const styles = {
  default: {
    boxShadow: 'none',
    border: '1px solid #B0BEC5',
  },
  expandButton: { marginTop: 8 },
};

export default class ForumPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpandable: false,
      isExpanded: true,
    };
  }

  componentDidMount() {
    const renderedTextHeight = this.divElement.clientHeight;
    this.setState({
      isExpandable:
        this.props.isExpandable && renderedTextHeight > MAX_POST_HEIGHT,
      isExpanded: !this.props.isExpandable,
    });
  }

  render() {
    return (
      <Card
        style={{ ...styles.default, ...this.props.style }}
        className="forum-post"
      >
        <CardHeader
          title={this.props.post.userName}
          subtitle={moment(this.props.post.updatedAt).format(
            'MMM DD, YYYY h:mma',
          )}
          avatar={this.props.post.avatar}
        />
        <Divider />
        <CardText>
          <div
            dangerouslySetInnerHTML={{ __html: this.props.post.text }}
            ref={(divElement) => {
              this.divElement = divElement;
            }}
            style={{
              height:
                this.state.isExpanded || !this.state.isExpandable
                  ? 'auto'
                  : MAX_POST_HEIGHT,
              overflow: 'hidden',
            }}
          />
          {this.state.isExpandable && (
            <FlatButton
              label={
                this.state.isExpanded ? (
                  <FormattedMessage {...translations.showLess} />
                ) : (
                  <FormattedMessage {...translations.showMore} />
                )
              }
              onClick={(event) => {
                event.persist();
                this.setState((oldState) => ({
                  isExpanded: !oldState.isExpanded,
                }));
              }}
              style={styles.expandButton}
              primary
              className="forum-post-expand-button"
            />
          )}
        </CardText>
      </Card>
    );
  }
}

ForumPost.propTypes = {
  post: PropTypes.shape({
    text: PropTypes.string,
    userName: PropTypes.string,
    avatar: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  isExpandable: PropTypes.bool,
  style: PropTypes.object,
};
