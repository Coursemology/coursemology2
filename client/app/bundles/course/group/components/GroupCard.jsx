import { Button } from '@material-ui/core';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
} from '@mui/material';
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
      <Tooltip title={button.label} key={`tooltip_${button.label.props.id}`}>
        <IconButton
          key={button.label.props.id}
          onClick={button.onClick}
          style={{
            ...styles.iconButton,
            ...(isLast ? {} : styles.nonLastButton),
          }}
        >
          {button.icon}
        </IconButton>
      </Tooltip>
    );
  }
  return (
    <Button
      variant="contained"
      color="primary"
      key={button.label.props.id}
      onClick={button.onClick}
      style={isLast ? undefined : styles.nonLastButton}
    >
      {button.label}
    </Button>
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
        titleTypographyProps={
          titleButtons.length > 0
            ? { style: styles.cardHeaderFullWidthTitle }
            : {}
        }
        subheader={subtitle}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
      />
    ) : null}
    <CardContent style={styles.body}>{children}</CardContent>
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
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element,
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
};

export default GroupCard;
