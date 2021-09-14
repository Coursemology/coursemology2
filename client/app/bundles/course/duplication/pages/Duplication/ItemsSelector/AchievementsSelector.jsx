import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import Checkbox from 'material-ui/Checkbox';
import Thumbnail from 'lib/components/Thumbnail';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { setItemSelectedBoolean } from 'course/duplication/actions';
import { achievementShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import BulkSelectors from 'course/duplication/components/BulkSelectors';

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.AchievementsSelector.noItems',
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

class AchievementsSelector extends React.Component {
  setAllAchievementsSelection = (value) => {
    const { dispatch, achievements } = this.props;

    achievements.forEach((achievement) => {
      dispatch(
        setItemSelectedBoolean(
          duplicableItemTypes.ACHIEVEMENT,
          achievement.id,
          value,
        ),
      );
    });
  };

  renderRow(achievement) {
    const { dispatch, selectedItems } = this.props;
    const checked = !!selectedItems[duplicableItemTypes.ACHIEVEMENT][
      achievement.id
    ];

    return (
      <Checkbox
        key={achievement.id}
        label={
          <span>
            <TypeBadge itemType={duplicableItemTypes.ACHIEVEMENT} />
            {achievement.published || <UnpublishedIcon />}
            <Thumbnail
              src={achievement.url}
              style={styles.badge}
              rootStyle={styles.badgeContainer}
            />
            {achievement.title}
          </span>
        }
        checked={checked}
        onCheck={(e, value) =>
          dispatch(
            setItemSelectedBoolean(
              duplicableItemTypes.ACHIEVEMENT,
              achievement.id,
              value,
            ),
          )
        }
      />
    );
  }

  renderBody() {
    const { achievements } = this.props;

    if (achievements.length < 1) {
      return (
        <Subheader>
          <FormattedMessage {...translations.noItems} />
        </Subheader>
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

  render() {
    const { achievements } = this.props;
    if (!achievements) {
      return null;
    }

    return (
      <>
        <h2>
          <FormattedMessage
            {...defaultComponentTitles.course_achievements_component}
          />
        </h2>
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
