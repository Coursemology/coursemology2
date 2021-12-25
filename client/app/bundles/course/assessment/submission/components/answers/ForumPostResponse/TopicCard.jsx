import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
  Divider,
  FontIcon,
  RaisedButton,
} from 'material-ui';
import { indigo50 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

import {
  postPackShape,
  topicOverviewShape,
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
        className="topic-card"
        expanded={this.state.isExpanded}
        onExpandChange={this.handleIsExpandedChange}
        style={this.props.style}
      >
        <CardHeader
          actAsExpander={true}
          showExpandableButton={true}
          style={styles.cardHeader}
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
        />
        <Divider />
        <CardActions expandable={true} style={styles.cardActions}>
          <RaisedButton
            href={getForumTopicURL(courseId, forumId, topicPostPack.topic.ic)}
            icon={<FontIcon className="fa fa-external-link" />}
            label={<FormattedMessage {...translations.viewTopicInNewTab} />}
            labelPosition="before"
            target="_blank"
          />
        </CardActions>
        <Divider />
        <CardText expandable={true}>
          {topicPostPack.postPacks.map((postPack, index) => (
            <ForumPostOption
              key={`post-pack-${postPack.corePost.id}`}
              isSelected={selectedPostIds.has(postPack.corePost.id)}
              onSelectPostPack={(postPackSelected, isSelected) =>
                this.props.onSelectPostPack(postPackSelected, isSelected)
              }
              postPack={postPack}
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
