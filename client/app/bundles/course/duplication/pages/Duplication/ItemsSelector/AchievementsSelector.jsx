import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { ListSubheader, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { achievementShape } from 'course/duplication/propTypes';
import { actions } from 'course/duplication/store';
import { getAchievementBadgeUrl } from 'course/helper/achievements';
import { defaultComponentTitles } from 'course/translations.intl';
import Thumbnail from 'lib/components/core/Thumbnail';

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.AchievementsSelector.noItems',
    defaultMessage: 'There are no achievements to duplicate.',
  },
});

const styles = {
  badge: {
    maxHeight: 24,
    maxWidth: 24,
  },
  badgeContainer: {
    zIndex: 3,
    position: 'relative',
    display: 'inline-block',
    marginRight: 5,
  },
};

class AchievementsSelector extends Component {
  setAllAchievementsSelection = (value) => {
    const { dispatch, achievements } = this.props;

    achievements.forEach((achievement) => {
      dispatch(
        actions.setItemSelectedBoolean(
          duplicableItemTypes.ACHIEVEMENT,
          achievement.id,
          value,
        ),
      );
    });
  };

  renderBody() {
    const { achievements } = this.props;

    if (achievements.length < 1) {
      return (
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.noItems} />
        </ListSubheader>
      );
    }

    return (
      <>
        {achievements.length > 1 ? (
          <BulkSelectors
            callback={this.setAllAchievementsSelection}
            styles={{ selectLink: { marginLeft: 0 } }}
          />
        ) : null}
        {achievements.map((achievement) => this.renderRow(achievement))}
      </>
    );
  }

  renderRow(achievement) {
    const { dispatch, selectedItems } = this.props;
    const checked =
      !!selectedItems[duplicableItemTypes.ACHIEVEMENT][achievement.id];
    const label = (
      <span style={{ display: 'flex', alignItems: 'centre' }}>
        <TypeBadge itemType={duplicableItemTypes.ACHIEVEMENT} />
        {achievement.published || <UnpublishedIcon />}
        <Thumbnail
          rootStyle={styles.badgeContainer}
          src={getAchievementBadgeUrl(achievement.url, true)}
          style={styles.badge}
        />
        {achievement.title}
      </span>
    );
    return (
      <IndentedCheckbox
        key={achievement.id}
        checked={checked}
        label={label}
        onChange={(e, value) =>
          dispatch(
            actions.setItemSelectedBoolean(
              duplicableItemTypes.ACHIEVEMENT,
              achievement.id,
              value,
            ),
          )
        }
      />
    );
  }

  render() {
    const { achievements } = this.props;
    if (!achievements) {
      return null;
    }

    return (
      <>
        <Typography className="mt-5 mb-5" variant="h2">
          <FormattedMessage
            {...defaultComponentTitles.course_achievements_component}
          />
        </Typography>
        {this.renderBody()}
      </>
    );
  }
}

AchievementsSelector.propTypes = {
  achievements: PropTypes.arrayOf(achievementShape),
  selectedItems: PropTypes.shape({}),

  dispatch: PropTypes.func.isRequired,
};

export default connect(({ duplication }) => ({
  achievements: duplication.achievementsComponent,
  selectedItems: duplication.selectedItems,
}))(AchievementsSelector);
