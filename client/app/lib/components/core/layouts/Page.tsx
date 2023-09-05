import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';

interface PageProps {
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  backTo?: string | boolean;
  className?: string;
  unpadded?: boolean;
}

interface PageSectionProps {
  className?: string;
  children?: ReactNode;
}

const Page = (props: PageProps): JSX.Element => {
  const { backTo: route } = props;

  const navigate = useNavigate();

  return (
    <>
      {(props.title || props.actions) && (
        <header className="flex min-h-[6rem] items-center bg-white px-6">
          <div className="flex w-full flex-wrap justify-between">
            {props.title && (
              <div className="flex items-center space-x-4">
                {route && (
                  <IconButton
                    data-testid="ArrowBackIconButton"
                    onClick={(): void =>
                      route === true ? navigate(-1) : navigate(route)
                    }
                  >
                    <ArrowBack data-testid="ArrowBack" />
                  </IconButton>
                )}

                <Typography variant="h5">{props.title}</Typography>
              </div>
            )}

            {props.actions && (
              <div className="flex flex-grow justify-end space-x-2 py-4 pl-4">
                {props.actions}
              </div>
            )}
          </div>
        </header>
      )}

      <main
        className={`relative ${!props.unpadded ? 'p-6' : ''} ${
          props.className ?? ''
        }`}
      >
        {props.children}
      </main>
    </>
  );
};

const PaddedPageSection = (props: PageSectionProps): JSX.Element => (
  <section className={`p-6 ${props.className ?? ''}`}>{props.children}</section>
);

const UnpaddedPageSection = (props: PageSectionProps): JSX.Element => (
  <section className={`-m-6 ${props.className ?? ''}`}>
    {props.children}
  </section>
);

export default Object.assign(Page, {
  PaddedSection: PaddedPageSection,
  UnpaddedSection: UnpaddedPageSection,
});
