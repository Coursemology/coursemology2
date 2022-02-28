import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  ListSubheader,
} from '@material-ui/core';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { achievementShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';

const styles = {
  badge: {
    maxHeight: 24,
    maxWidth: 24,
    marginRight: 5,
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    width: 'auto',
  },
};

class AchievementsListing extends Component {
  static renderRow(achievement) {
    return (
      <FormControlLabel
        control={<Checkbox checked color="primary" />}
        key={`achievement_${achievement.id}`}
        label={
          <span style={{ display: 'flex', alignItems: 'centre' }}>
            <TypeBadge itemType={duplicableItemTypes.ACHIEVEMENT} />
            <UnpublishedIcon tooltipId="itemUnpublished" />
            <img
              src={achievement.url}
              alt={achievement.url}
              style={styles.badge}
            />
            {achievement.title}
          </span>
        }
        style={styles.row}
      />
    );
  }

  selectedAchievements() {
    const { achievements, selectedItems } = this.props;
    return achievements
      ? achievements.filter(
          (achievement) =>
            selectedItems[duplicableItemTypes.ACHIEVEMENT][achievement.id],
        )
      : [];
  }

  render() {
    const selectedAchievements = this.selectedAchievements();
    if (selectedAchievements.length < 1) {
      return null;
    }

    return (
      <>
        <ListSubheader disableSticky>
          <FormattedMessage
            {...defaultComponentTitles.course_achievements_component}
          />
        </ListSubheader>
        <Card>
          <CardContent>
            {selectedAchievements.map(AchievementsListing.renderRow)}
          </CardContent>
        </Card>
      </>
    );
  }
}

AchievementsListing.propTypes = {
  achievements: PropTypes.arrayOf(achievementShape),
  selectedItems: PropTypes.shape({}),
};

export default connect(({ duplication }) => ({
  achievements: duplication.achievementsComponent,
  selectedItems: duplication.selectedItems,
}))(AchievementsListing);
