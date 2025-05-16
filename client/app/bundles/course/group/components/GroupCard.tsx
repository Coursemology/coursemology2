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
  label: string | ReactElement;
  onClick: () => void;
  isDisabled?: boolean;
  icon?: ReactElement;
}

export interface GroupCardBottomButton {
  label: string | ReactElement;
  onClick: () => void;
  isDisabled?: boolean;
  icon?: ReactElement;
  isRight?: boolean;
}

function mapButtonObjectToElement(
  button: GroupCardTitleButton | GroupCardBottomButton,
  isLast: boolean,
  index: number,
): ReactElement {
  return button.icon ? (
    <Tooltip key={`tooltip_${index}`} title={button.label}>
      <IconButton
        key={index}
        className={`h-15 w-15 p-2.5 ${!isLast ? 'mr-4' : ''}`}
        onClick={button.onClick}
      >
        {button.icon}
      </IconButton>
    </Tooltip>
  ) : (
    <Button
      key={index}
      className={!isLast ? 'mr-4' : ''}
      color="primary"
      onClick={button.onClick}
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
  <Card className={`mb-8 ${className}`}>
    {title || subtitle ? (
      <CardHeader
        subheader={subtitle}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        title={
          <div className="flex justify-between items-center w-full">
            <h3 className="font-bold mt-2 mb-0">{title}</h3>
            {titleButtons.length > 0 && (
              <div className="flex justify-center items-center">
                {titleButtons.map((button, index) =>
                  mapButtonObjectToElement(
                    button,
                    index === titleButtons.length - 1,
                    index,
                  ),
                )}
              </div>
            )}
          </div>
        }
        titleTypographyProps={
          titleButtons.length > 0 ? { className: 'w-full pr-0' } : {}
        }
      />
    ) : null}
    <CardContent className="pt-0">{children}</CardContent>
    {bottomButtons.length > 0 ? (
      <CardActions className="p-6 flex justify-between">
        <div>
          {bottomButtons
            .filter((b) => !b.isRight)
            .map((button, index) =>
              mapButtonObjectToElement(
                button,
                index === titleButtons.length - 1,
                index,
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
                index,
              ),
            )}
        </div>
      </CardActions>
    ) : null}
  </Card>
);

export default GroupCard;
