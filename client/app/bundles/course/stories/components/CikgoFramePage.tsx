import Page from 'lib/components/core/layouts/Page';

const getCikgoEmbedURL = (rawURL: string): string => {
  const url = new URL(rawURL);
  url.searchParams.set('embedOrigin', window.location.origin);
  return url.toString();
};

interface CikgoFramePageProps {
  url: string;
}

const CikgoFramePage = (props: CikgoFramePageProps): JSX.Element => {
  return (
    <Page className="leading-[0px]" unpadded>
      <iframe
        className="border-none w-full h-[calc(100vh_-_4rem)] flex"
        src={getCikgoEmbedURL(props.url)}
        title="embed"
      />
    </Page>
  );
};

export default CikgoFramePage;
