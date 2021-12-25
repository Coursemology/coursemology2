import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Card, CardText } from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import Subheader from 'material-ui/Subheader';
import PropTypes from 'prop-types';

import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { achievementShape } from 'course/duplication/propTypes';
import { defaultComponentTitles } from 'course/translations.intl';

const styles = {
  badge: {
    maxHeight: 24,
    maxWidth: 24,
    marginRight: 5,
  },
};

class AchievementsListing extends Component {
  static renderRow(achievement) {
    return (
      <Checkbox
        key={achievement.id}
        checked={true}
        label={
          <span>
            <TypeBadge itemType={duplicableItemTypes.ACHIEVEMENT} />
            <UnpublishedIcon tooltipId="itemUnpublished" />
            <img
              alt={achievement.url}
              src={achievement.url}
              style={styles.badge}
            />
            {achievement.title}
          </span>
        }
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
        <Subheader>
          <FormattedMessage
            {...defaultComponentTitles.course_achievements_component}
          />
        </Subheader>
        <Card>
          <CardText>
            {selectedAchievements.map(AchievementsListing.renderRow)}
          </CardText>
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
