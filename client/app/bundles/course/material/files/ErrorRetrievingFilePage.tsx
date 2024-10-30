import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Cancel, InsertDriveFileOutlined } from '@mui/icons-material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import BaseRetrieveMaterialPage from '../component/BaseRetrieveMaterialPage';

const translations = defineMessages({
  problemRetrievingFile: {
    id: 'course.material.files.ErrorRetrievingFilePage.problemRetrievingFile',
    defaultMessage: 'Problem retrieving file',
  },
  problemRetrievingFileDescription: {
    id: 'course.material.files.ErrorRetrievingFilePage.problemRetrievingFileDescription',
    defaultMessage:
      "Either it no longer exists, you don't have the permission to access it, or something unexpected happened when we were trying to retrieve it.",
  },
  goToTheWorkbin: {
    id: 'course.material.files.ErrorRetrievingFilePage.goToTheWorkbin',
    defaultMessage: 'Go to the Workbin',
  },
});

const ErrorRetrievingFilePage = (): JSX.Element => {
  const { t } = useTranslation();

  const params = useParams();
  const workbinURL = `/courses/${params.courseId}/materials/folders/${params.folderId}`;

  return (
    <BaseRetrieveMaterialPage
      description={t(translations.problemRetrievingFileDescription)}
      illustration={
        <div className="relative">
          <InsertDriveFileOutlined className="text-[6rem]" color="disabled" />

          <Cancel
            className="absolute bottom-0 -right-2 text-[4rem] bg-white rounded-full"
            color="error"
          />
        </div>
      }
      title={t(translations.problemRetrievingFile)}
    >
      <Link className="mt-10" to={workbinURL}>
        {t(translations.goToTheWorkbin)}
      </Link>
    </BaseRetrieveMaterialPage>
  );
};

export default ErrorRetrievingFilePage;
