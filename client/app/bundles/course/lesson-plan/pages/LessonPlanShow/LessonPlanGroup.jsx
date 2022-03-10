/* eslint-disable camelcase */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Element } from 'react-scroll';
import { Card, CardContent, CardHeader, IconButton } from '@material-ui/core';
import { Collapse, Divider } from '@mui/material';
import { grey } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment, { longDate } from 'lib/moment';
import LessonPlanItem from './LessonPlanItem';
import MilestoneAdminTools from './MilestoneAdminTools';

const translations = defineMessages({
  ungroupedItems: {
    id: 'course.lessonPlan.LessonPlanGroup.ungroupedItems',
    defaultMessage: 'Ungrouped Items',
  },
  noItems: {
    id: 'course.lessonPlan.LessonPlanGroup.noItems',
    defaultMessage: 'No items for this milestone.',
  },
});

const styles = {
  card: {
    marginTop: 20,
  },
  milestoneTitle: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  items: {
    padding: 0,
  },
  divider: {
    height: 2,
  },
  expandIconRotated: {
    padding: 0,
    transform: 'rotate(180deg)',
  },
  expandIcon: {
    padding: 0,
  },
};

class LessonPlanGroup extends Component {
  constructor(props) {
    super(props);
    this.state = { expanded: props.initiallyExpanded };
  }

  static renderNoItemsMessage() {
    return (
      <>
        <Divider style={styles.divider} />
        <CardContent>
          <FormattedMessage {...translations.noItems} />
        </CardContent>
      </>
    );
  }

  handleExpandClick = () => {
    this.setState((prevState) => ({
      expanded: !prevState.expanded,
    }));
  };

  renderDefaultMilestone() {
    const {
      group: { items },
    } = this.props;
    return this.renderMilestoneCardTitle({
      id: null,
      title: <FormattedMessage {...translations.ungroupedItems} />,
      description: null,
      start_at: items[0].start_at,
    });
  }

  renderMilestoneCardTitle(milestone) {
    const { title, description, start_at } = milestone;

    return (
      <CardHeader
        style={{ backgroundColor: grey[50] }}
        subheader={
          <span>
            {moment(start_at).format(longDate)}
            <br />
            <span dangerouslySetInnerHTML={{ __html: description }} />
          </span>
        }
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        title={
          <div style={styles.milestoneTitle}>
            {title}
            <div>
              <MilestoneAdminTools milestone={milestone} />
              <IconButton
                onClick={this.handleExpandClick}
                style={
                  this.state.expanded
                    ? styles.expandIconRotated
                    : styles.expandIcon
                }
              >
                <ExpandMoreIcon />
              </IconButton>
            </div>
          </div>
        }
        titleTypographyProps={{ variant: 'h6' }}
      />
    );
  }

  render() {
    const {
      group: { id, milestone, items },
    } = this.props;
    if (!milestone && items.length < 1) {
      return null;
    }

    return (
      <Element name={id}>
        <Card style={styles.card}>
          {milestone
            ? this.renderMilestoneCardTitle(milestone)
            : this.renderDefaultMilestone()}
          <Collapse in={this.state.expanded} unmountOnExit>
            <CardContent style={styles.items}>
              {items.length > 0
                ? items.map((item) => (
                    <LessonPlanItem key={item.id} {...{ item }} />
                  ))
                : LessonPlanGroup.renderNoItemsMessage()}
            </CardContent>
          </Collapse>
        </Card>
      </Element>
    );
  }
}

LessonPlanGroup.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string,
    milestone: PropTypes.object,
    items: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  initiallyExpanded: PropTypes.bool,
};

export default LessonPlanGroup;
