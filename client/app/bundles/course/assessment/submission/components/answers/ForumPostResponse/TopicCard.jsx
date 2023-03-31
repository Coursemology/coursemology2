import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { OpenInNew } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionActions,
  AccordionSummary,
  Button,
  Divider,
} from '@mui/material';
import { indigo } from '@mui/material/colors';
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
    id: 'course.assessment.submission.answers.ForumPostResponse.TopicCard.topicCardTitleTypeNoneSelected',
    defaultMessage: 'Topic',
  },
  topicCardTitleTypeSelected: {
    id: 'course.assessment.submission.answers.ForumPostResponse.TopicCard.topicCardTitleTypeSelected',
    defaultMessage: 'Topic ({numSelected} selected)',
  },
  viewTopicInNewTab: {
    id: 'course.assessment.submission.answers.ForumPostResponse.TopicCard.viewTopicInNewTab',
    defaultMessage: 'View Topic',
  },
});

const styles = {
  AccordionSummary: {
    backgroundColor: indigo[50],
    padding: '8px 16px',
  },
  AccordionActions: {
    justifyContent: 'flex-start',
    padding: 16,
  },
  container: {
    padding: 16,
  },
  icon: {
    marginLeft: 4,
  },
  nonLastPostOption: {
    marginBottom: 16,
  },
};

export default class TopicCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: this.props.isExpandedOnLoad,
    };
  }

  handleIsExpandedChange = (event, isExpanded) => {
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
      <Accordion
        className="topic-card"
        expanded={this.state.isExpanded}
        onChange={this.handleIsExpandedChange}
        style={this.props.style}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={styles.AccordionSummary}
        >
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
        </AccordionSummary>
        <Divider />
        <AccordionActions style={styles.AccordionActions}>
          <Button
            href={getForumTopicURL(courseId, forumId, topicPostPack.topic.id)}
            target="_blank"
            variant="contained"
          >
            <FormattedMessage {...translations.viewTopicInNewTab} />
            <OpenInNew style={styles.icon} />
          </Button>
        </AccordionActions>
        <Divider />
        <div style={styles.container}>
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
        </div>
      </Accordion>
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
