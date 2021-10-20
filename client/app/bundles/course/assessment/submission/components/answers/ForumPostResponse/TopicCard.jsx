import React from 'react';
import PropTypes from 'prop-types';
import {
  CardHeader,
  RaisedButton,
  Card,
  CardText,
  CardActions,
  Divider,
  FontIcon,
} from 'material-ui';
import { indigo50 } from 'material-ui/styles/colors';

import {
  topicOverviewShape,
  postPackShape,
} from 'course/assessment/submission/propTypes';
import { getForumTopicURL } from 'lib/helpers/url-builders';

import ForumPostOption from './ForumPostOption';
import CardTitle from './CardTitle';

const styles = {
  card: {},
  cardHeader: {
    backgroundColor: indigo50,
    padding: '8px 16px',
  },
  cardActions: {
    padding: 16,
  },
  nonLastPostOption: {
    marginBottom: 16,
  },
};

export default class TopicCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: this.props.isExpandedOnLoad,
    };
  }

  handleIsExpandedChange = (isExpanded) => {
    this.setState({ isExpanded });
  };

  render() {
    const { topicPostPack, courseId, forumId } = this.props;
    const selectedPostIds = new Set(
      this.props.selectedPostPacks.map((pack) => pack.corePost.id),
    );
    const numSelectedInTopic = topicPostPack.postPacks.filter((pack) =>
      selectedPostIds.has(pack.corePost.id),
    ).length;

    return (
      <Card
        expanded={this.state.isExpanded}
        onExpandChange={this.handleIsExpandedChange}
        style={{ ...styles.card, ...(this.props.style ?? {}) }}
      >
        <CardHeader
          title={
            <CardTitle
              title={this.props.topicPostPack.topic.title}
              type={`Topic${
                numSelectedInTopic > 0
                  ? ` (${numSelectedInTopic} selected)`
                  : ''
              }`}
            />
          }
          actAsExpander
          showExpandableButton
          style={styles.cardHeader}
        />
        <Divider />
        <CardActions expandable style={styles.cardActions}>
          <RaisedButton
            label="View topic"
            href={getForumTopicURL(courseId, forumId, topicPostPack.topic.ic)}
            target="_blank"
            labelPosition="before"
            icon={<FontIcon className="fa fa-external-link" />}
          />
        </CardActions>
        <Divider />
        <CardText expandable>
          {topicPostPack.postPacks?.map((postPack, index) => (
            <ForumPostOption
              postPack={postPack}
              isSelected={selectedPostIds.has(postPack.corePost.id)}
              onSelectPostPack={(postPackSelected, isSelected) =>
                this.props.onSelectPostPack(postPackSelected, isSelected)
              }
              key={`post-pack-${postPack.corePost.id}`}
              style={
                index < topicPostPack.postPacks?.length - 1
                  ? styles.nonLastPostOption
                  : {}
              }
            />
          ))}
        </CardText>
      </Card>
    );
  }
}

TopicCard.propTypes = {
  topicPostPack: PropTypes.shape({
    topic: topicOverviewShape,
    postPacks: PropTypes.arrayOf(postPackShape),
  }).isRequired,
  selectedPostPacks: PropTypes.arrayOf(postPackShape).isRequired,
  onSelectPostPack: PropTypes.func.isRequired,
  courseId: PropTypes.number.isRequired,
  forumId: PropTypes.number.isRequired,
  isExpandedOnLoad: PropTypes.bool.isRequired,
  style: PropTypes.object,
};
