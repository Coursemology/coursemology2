import React from 'react';
import { Divider, Card, CardHeader, CardText } from 'material-ui';
import PropTypes from 'prop-types';

const styles = {
  default: {
    boxShadow: 'none',
    border: '1px solid #B0BEC5',
  },
  expandButton: { color: '#03A9F4' },
};

const maxHeight = 160;

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
      isExpandable: this.props.isExpandable && renderedTextHeight > maxHeight,
      isExpanded: !this.props.isExpandable,
    });
  }

  render() {
    return (
      <Card style={{ ...styles.default, ...this.props.style }}>
        <CardHeader
          title={this.props.post.userName}
          subtitle={this.props.post.updatedAt}
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
                  : maxHeight,
              overflow: 'hidden',
            }}
          />
          {this.state.isExpandable && (
            <div style={{ paddingTop: 8 }}>
              {!this.state.isExpanded && <div style={{ height: 10 }} />}
              <button
                type="button"
                onClick={() =>
                  this.setState((oldState) => ({
                    isExpanded: !oldState.isExpanded,
                  }))
                }
                style={styles.expandButton}
              >
                {this.state.isExpanded ? 'SHOW LESS' : 'SHOW MORE'}
              </button>
            </div>
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
