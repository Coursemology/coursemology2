import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { useLoaderData } from 'react-router-dom';
import { Download, DownloadingOutlined, Warning } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FileListData } from 'types/course/material/files';

import CourseAPI from 'api/course';
import Link from 'lib/components/core/Link';
import useEffectOnce from 'lib/hooks/useEffectOnce';
import useTranslation from 'lib/hooks/useTranslation';

import BaseDownloadFilePage from './components/BaseDownloadFilePage';

const DEFAULT_FILE_NAME = 'file';

const translations = defineMessages({
  downloading: {
    id: 'course.material.files.DownloadingFilePage.downloading',
    defaultMessage: 'Downloading {name}',
  },
  downloadingDescription: {
    id: 'course.material.files.DownloadingFilePage.downloadingDescription',
    defaultMessage:
      'This file should start downloading automatically now. ' +
      "If it doesn't, you can try again by clicking the link below or refreshing this page.",
  },
  tryDownloadingAgain: {
    id: 'course.material.files.DownloadingFilePage.tryDownloadingAgain',
    defaultMessage: 'Try downloading again',
  },
  clickToDownloadFile: {
    id: 'course.material.files.DownloadingFilePage.clickToDownloadFile',
    defaultMessage: 'Download {name}',
  },
  clickToDownloadFileDescription: {
    id: 'course.material.files.DownloadingFilePage.clickToDownloadFileDescription',
    defaultMessage:
      'Something happened when initiating an automatic download. Click the link below to immediately download the file.',
  },
});

interface BaseDownloadingFilePageProps {
  url: string;
  name: string;
}

const SuccessDownloadingFilePage = (
  props: BaseDownloadingFilePageProps,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <BaseDownloadFilePage
      description={t(translations.downloadingDescription)}
      illustration={
        <DownloadingOutlined className="text-[6rem]" color="success" />
      }
      title={props.name}
    >
      <Link className="mt-10" href={props.url}>
        {t(translations.tryDownloadingAgain)}
      </Link>
    </BaseDownloadFilePage>
  );
};

const ErrorStartingDownloadFilePage = (
  props: BaseDownloadingFilePageProps,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <BaseDownloadFilePage
      description={t(translations.clickToDownloadFileDescription)}
      illustration={
        <div className="relative">
          <DownloadingOutlined className="text-[6rem]" color="disabled" />

          <Warning
            className="absolute bottom-0 -right-2 text-[4rem]"
            color="warning"
          />
        </div>
      }
      title={t(translations.clickToDownloadFile, { name: props.name })}
    >
      <Button
        className="mt-10"
        href={props.url}
        startIcon={<Download />}
        variant="contained"
      >
        {props.name}
      </Button>
    </BaseDownloadFilePage>
  );
};

const DownloadingFilePage = (): JSX.Element => {
  const data = useLoaderData();
  if (!data) throw new Error('No download data. This should never happen.');

  const { url: directDownloadURL, name } = data as FileListData;

  const [errored, setErrored] = useState(false);

  useEffectOnce(() => {
    const download = async (): Promise<void> => {
      const { url, shouldDownload, revoke } =
        await CourseAPI.materials.download(directDownloadURL);

      const anchor = document.createElement('a');

      if (shouldDownload) {
        anchor.href = url;
        anchor.download = name ?? DEFAULT_FILE_NAME;
      } else {
        // This will still abort any ongoing Axios calls, and potentially throw `AxiosError` or
        // `NS_BINDING_ABORTED`, but we do this because otherwise, the user can view, but cannot
        // download this file. If it's a PDF, a PDF viewer will appear, but the user cannot download
        // (on Chrome) or won't get the file name (on Safari and Firefox). I reckon it's safe to do
        // this because the page will be replaced with a PDF viewer anyway.
        anchor.href = directDownloadURL;
      }

      anchor.click();
      revoke();
    };

    download().catch(() => setErrored(true));
  });

  return errored ? (
    <ErrorStartingDownloadFilePage name={name} url={directDownloadURL} />
  ) : (
    <SuccessDownloadingFilePage name={name} url={directDownloadURL} />
  );
};

export default DownloadingFilePage;
