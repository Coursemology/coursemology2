import { FC, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

import TitleBar from 'lib/components/navigation/TitleBar';

interface Props {
  title: ReactElement | string;
  returnLink?: string;
  toolbars?: ReactElement[];
}

const PageHeader: FC<Props> = (props) => {
  const { title, returnLink, toolbars } = props;
  const navigate = useNavigate();

  return (
    <TitleBar
      data-testid="TitleBar"
      iconElementLeft={
        returnLink ? (
          <IconButton
            data-testid="ArrowBackIconButton"
            onClick={(): void => navigate(returnLink)}
          >
            <ArrowBack data-testid="ArrowBack" htmlColor="white" />
          </IconButton>
        ) : null
      }
      iconElementRight={toolbars && toolbars.length > 0 ? toolbars : null}
      title={title}
    />
  );
};

export default PageHeader;
