import React from 'react';

import {
  Card,
  CardActions,
  CardHeader,
  CardText,
  IconButton,
  RaisedButton,
} from 'material-ui';
import PropTypes from 'prop-types';

export const groupCardTitleButtonShape = PropTypes.shape({
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  icon: PropTypes.element,
});

export const groupCardBottomButtonShape = PropTypes.shape({
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  icon: PropTypes.element,
  isRight: PropTypes.bool,
});

const styles = {
  card: {
    marginBottom: '2rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cardHeaderFullWidthTitle: {
    width: '100%',
    paddingRight: 0,
  },
  title: {
    fontWeight: 'bold',
    marginTop: '0.5rem',
    marginBottom: 0,
  },
  body: {
    paddingTop: 0,
  },
  actions: {
    padding: 16,
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nonLastButton: {
    marginRight: '1rem',
  },
  iconButton: {
    height: 36,
    width: 36,
    padding: 6,
  },
};

function mapButtonObjectToElement(button, isLast) {
  if (button.icon) {
    return (
      <IconButton
        key={button.label}
        tooltip={button.label}
        onClick={button.onClick}
        style={{
          ...styles.iconButton,
          ...(isLast ? {} : styles.nonLastButton),
        }}
      >
        {button.icon}
      </IconButton>
    );
  }
  return (
    <RaisedButton
      key={button.label}
      label={button.label}
      onClick={button.onClick}
      primary
      style={isLast ? undefined : styles.nonLastButton}
    />
  );
}

/**
 * A wrapper around MUI card to help standardise styling for groups.
 */
const GroupCard = ({
  title,
  subtitle,
  titleButtons = [],
  bottomButtons = [],
  className = '',
  children,
}) => (
  <Card style={styles.card} className={className}>
    {title || subtitle ? (
      <CardHeader
        title={
          <div style={styles.cardHeader}>
            <h3 style={styles.title}>{title}</h3>
            {titleButtons.length > 0 && (
              <div style={styles.buttonsContainer}>
                {titleButtons.map((button, index) =>
                  mapButtonObjectToElement(
                    button,
                    index === titleButtons.length - 1,
                  ),
                )}
              </div>
            )}
          </div>
        }
        subtitle={subtitle}
        textStyle={
          titleButtons.length > 0 ? styles.cardHeaderFullWidthTitle : {}
        }
      />
    ) : null}
    <CardText style={styles.body}>{children}</CardText>
    {bottomButtons.length > 0 ? (
      <CardActions style={styles.actions}>
        <div>
          {bottomButtons
            .filter((b) => !b.isRight)
            .map((button, index) =>
              mapButtonObjectToElement(
                button,
                index === titleButtons.length - 1,
              ),
            )}
        </div>
        <div>
          {bottomButtons
            .filter((b) => b.isRight)
            .map((button, index) =>
              mapButtonObjectToElement(
                button,
                index === titleButtons.length - 1,
              ),
            )}
        </div>
      </CardActions>
    ) : null}
  </Card>
);

GroupCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  titleButtons: PropTypes.arrayOf(groupCardTitleButtonShape),
  bottomButtons: PropTypes.arrayOf(groupCardBottomButtonShape),
  className: PropTypes.string,
  children: PropTypes.element.isRequired,
};

export default GroupCard;
