import { ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography } from '@mui/material';

import Link from '../Link';

import Page from './Page';

interface MarkdownPageProps extends ComponentProps<typeof Page> {
  markdown: string;
}

const MarkdownPage = (props: MarkdownPageProps): JSX.Element => {
  const { markdown, ...pageProps } = props;
  return (
    <Page {...pageProps}>
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <Typography className="mb-8" variant="h4">
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography className="mb-2" variant="h6">
              {children}
            </Typography>
          ),
          p: ({ children }) => (
            <Typography className="mb-6" variant="body2">
              {children}
            </Typography>
          ),
          li: ({ children }) => (
            <Typography className="mb-2" component="li" variant="body2">
              {children}
            </Typography>
          ),
          ul: ({ children }) => <ul className="mb-5 ml-7">{children}</ul>,
          a: ({ children, href }) => (
            <Link external href={href} opensInNewTab>
              {children}
            </Link>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>

      {props.children}
    </Page>
  );
};
export default MarkdownPage;
