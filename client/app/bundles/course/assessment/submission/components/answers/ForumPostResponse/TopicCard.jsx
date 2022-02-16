import React from 'react';
import { CardHeader, Card, CardText, CardActions, FontIcon } from 'material-ui';
import { Button, Divider } from '@material-ui/core';
import { indigo } from '@material-ui/core/colors';

import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import {
  topicOverviewShape,
  postPackShape,
} from 'course/assessment/submission/propTypes';
import { getForumTopicURL } from 'lib/helpers/url-builders';

import CardTitle from './CardTitle';
import ForumPostOption from './ForumPostOption';

const translations = defineMessages({
  topicCardTitleTypeNoneSelected: {
    id: 'course.assessment.submission.answer.forumPostResponse.topicCardTitleTypeNoneSelected',
    defaultMessage: 'Topic',
  },
  topicCardTitleTypeSelected: {
    id: 'course.assessment.submission.answer.forumPostResponse.topicCardTitleTypeSelected',
    defaultMessage: 'Topic ({numSelected} selected)',
  },
  viewTopicInNewTab: {
    id: 'course.assessment.submission.answer.forumPostResponse.viewTopicInNewTab',
    defaultMessage: 'View Topic',
  },
});

const styles = {
  cardHeader: {
    backgroundColor: indigo[50],
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
        style={this.props.style}
        className="topic-card"
      >
        <CardHeader
          title={
            <CardTitle
              title={this.props.topicPostPack.topic.title}
              type={
                numSelectedInTopic > 0 ? (
                  <FormattedMessage
                    values={{
                      numSelected: numSelectedInTopic,
                    }}
                    {...translations.topicCardTitleTypeSelected}
                  />
                ) : (
                  <FormattedMessage
                    {...translations.topicCardTitleTypeNoneSelected}
                  />
                )
              }
            />
          }
          actAsExpander
          showExpandableButton
          style={styles.cardHeader}
        />
        <Divider />
        <CardActions expandable style={styles.cardActions}>
          <Button
            variant="contained"
            href={getForumTopicURL(courseId, forumId, topicPostPack.topic.ic)}
            style={{ marginBottom: 16 }}
            target="_blank"
          >
            <FormattedMessage {...translations.viewTopicInNewTab} />
            <FontIcon className="fa fa-external-link" />
          </Button>
        </CardActions>
        <Divider />
        <CardText expandable>
          {topicPostPack.postPacks.map((postPack, index) => (
            <ForumPostOption
              postPack={postPack}
              isSelected={selectedPostIds.has(postPack.corePost.id)}
              onSelectPostPack={(postPackSelected, isSelected) =>
                this.props.onSelectPostPack(postPackSelected, isSelected)
              }
              key={`post-pack-${postPack.corePost.id}`}
              style={
                index < topicPostPack.postPacks.length - 1
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
