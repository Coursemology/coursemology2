import { Component } from 'react';
import {
  Button,
  Accordion,
  AccordionActions,
  AccordionSummary,
  Icon,
} from '@material-ui/core';
import { Divider } from '@mui/material';
import { indigo } from '@mui/material/colors';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
  AccordionSummary: {
    backgroundColor: indigo[50],
    padding: '8px 16px',
  },
  AccordionActions: {
    padding: 16,
  },
  container: {
    padding: 16,
  },
  icon: {
    marginLeft: 12,
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
        expanded={this.state.isExpanded}
        onChange={this.handleIsExpandedChange}
        style={this.props.style}
        className="topic-card"
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
            variant="contained"
            endIcon={
              <Icon className="fa fa-external-link" style={styles.icon} />
            }
            href={getForumTopicURL(courseId, forumId, topicPostPack.topic.ic)}
            style={{ marginBottom: 16 }}
            target="_blank"
          >
            <FormattedMessage {...translations.viewTopicInNewTab} />
          </Button>
        </AccordionActions>
        <Divider />
        <div style={styles.container}>
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
