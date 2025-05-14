import { FC, ReactElement, ReactNode } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
} from '@mui/material';

export interface GroupCardTitleButton {
  label: ReactElement;
  onClick: () => void;
  isDisabled?: boolean;
  icon?: ReactElement;
}

export interface GroupCardBottomButton {
  label: ReactElement;
  onClick: () => void;
  isDisabled?: boolean;
  icon?: ReactElement;
  isRight?: boolean;
}

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

function mapButtonObjectToElement(
  button: GroupCardTitleButton | GroupCardBottomButton,
  isLast: boolean,
): ReactElement {
  return button.icon ? (
    <Tooltip key={`tooltip_${button.label.props.id}`} title={button.label}>
      <IconButton
        key={button.label.props.id}
        onClick={button.onClick}
        style={{ ...styles.iconButton, ...(!isLast && styles.nonLastButton) }}
      >
        {button.icon}
      </IconButton>
    </Tooltip>
  ) : (
    <Button
      key={button.label.props.id}
      color="primary"
      onClick={button.onClick}
      style={isLast ? undefined : styles.nonLastButton}
      variant="contained"
    >
      {button.label}
    </Button>
  );
}

interface GroupCardProps {
  title?: string | ReactElement;
  subtitle?: string | ReactElement;
  titleButtons?: GroupCardTitleButton[];
  bottomButtons?: GroupCardBottomButton[];
  className?: string;
  children: ReactNode;
}

/**
 * A wrapper around MUI card to help standardise styling for groups.
 */
const GroupCard: FC<GroupCardProps> = ({
  title,
  subtitle,
  titleButtons = [],
  bottomButtons = [],
  className = '',
  children,
}) => (
  <Card className={className} style={styles.card}>
    {title || subtitle ? (
      <CardHeader
        subheader={subtitle}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
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

export default GroupCard;
