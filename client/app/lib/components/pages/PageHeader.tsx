import { FC, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import TitleBar from 'lib/components/TitleBar';

interface Props {
  title: string;
  returnLink?: string;
  toolbars?: ReactElement[];
}

const PageHeader: FC<Props> = (props) => {
  const { title, returnLink, toolbars } = props;
  const navigate = useNavigate();

  return (
    <TitleBar
      title={title}
      iconElementRight={toolbars && toolbars.length > 0 ? toolbars : null}
      iconElementLeft={
        returnLink ? (
          <IconButton
            onClick={(): void => navigate(returnLink)}
            data-testid="ArrowBackIconButton"
          >
            <ArrowBack htmlColor="white" data-testid="ArrowBack" />
          </IconButton>
        ) : null
      }
      data-testid="TitleBar"
    />
  );
};

export default PageHeader;
