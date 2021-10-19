import React from 'react';
import PropTypes from 'prop-types';

import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import {
  topicOverviewShape,
  postPackShape,
} from 'course/assessment/submission/propTypes';
import { getForumTopicURL } from 'lib/helpers/url-builders';
import Chip from './Chip';
import Option from './Option';

const styles = {
  card: {
    border: '1px solid #ccc',
    boxShadow: 'none',
    marginBottom: 12,
  },
  container: {
    display: 'table',
  },
  topicTitle: {
    backgroundColor: '#E8EAF6',
    paddingTop: 3,
    paddingBottom: 3,
  },
  topicTitleText: {
    fontSize: 15,
    margin: 0,
  },
};

export default class Topic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: this.props.isExpanded,
    };
  }

  handleIsExpandedChange = (isExpanded) => {
    this.setState({ isExpanded });
  };

  renderTitle() {
    return (
      <div>
        <Chip text="Topic" />
        {this.props.topicPostPack.topic.title}
      </div>
    );
  }

  render() {
    const { topicPostPack, courseId, forumId } = this.props;

    return (
      <Card
        expanded={this.state.isExpanded}
        onExpandChange={this.handleIsExpandedChange}
        style={styles.card}
      >
        <CardTitle
          title={this.renderTitle()}
          actAsExpander
          showExpandableButton
          style={styles.topicTitle}
          titleStyle={styles.topicTitleText}
        />
        <Divider />
        <CardActions expandable>
          <FlatButton
            label="View all posts in topic"
            href={getForumTopicURL(courseId, forumId, topicPostPack.topic.ic)}
            target="_blank"
            backgroundColor="#FBE9E7"
            labelPosition="before"
            primary
            icon={<FontIcon className="fa fa-external-link" />}
          />
        </CardActions>
        <Divider />
        <CardText expandable>
          <div style={styles.container}>
            {topicPostPack.postPacks?.map((postPack) => (
              <Option
                postPack={postPack}
                isSelected={this.props.selectedPostIds.includes(
                  postPack.corePost.id,
                )}
                onSelectPostPack={(postPackSelected, isSelected) =>
                  this.props.onSelectPostPack(postPackSelected, isSelected)
                }
                key={`post-pack-${postPack.corePost.id}`}
              />
            ))}
          </div>
        </CardText>
      </Card>
    );
  }
}

Topic.propTypes = {
  title: PropTypes.string,
  topicPostPack: PropTypes.shape({
    topic: topicOverviewShape,
    postPacks: PropTypes.arrayOf(postPackShape),
  }),
  selectedPostIds: PropTypes.arrayOf(PropTypes.number),
  onSelectPostPack: PropTypes.func,
  courseId: PropTypes.number,
  forumId: PropTypes.number,
  isExpanded: PropTypes.bool,
};
