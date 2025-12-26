import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  ListSubheader,
} from '@mui/material';
import PropTypes from 'prop-types';

import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { achievementShape } from 'course/duplication/propTypes';
import { getAchievementBadgeUrl } from 'course/helper/achievements';
import componentTranslations from 'course/translations';

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
        key={`achievement_${achievement.id}`}
        control={<Checkbox checked />}
        label={
          <span style={{ display: 'flex', alignItems: 'centre' }}>
            <TypeBadge itemType={duplicableItemTypes.ACHIEVEMENT} />
            <UnpublishedIcon tooltipId="itemUnpublished" />
            <img
              alt={getAchievementBadgeUrl(achievement.url, true)}
              src={getAchievementBadgeUrl(achievement.url, true)}
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
            {...componentTranslations.course_achievements_component}
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
