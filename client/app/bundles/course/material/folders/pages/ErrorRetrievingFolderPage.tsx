import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Cancel, FolderOutlined } from '@mui/icons-material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import MaterialStatusPage from '../../components/MaterialStatusPage';

const translations = defineMessages({
  problemRetrievingFolder: {
    id: 'course.material.folders.ErrorRetrievingFolderPage.problemRetrievingFolder',
    defaultMessage: 'Problem retrieving folder',
  },
  problemRetrievingFolderDescription: {
    id: 'course.material.folders.ErrorRetrievingFolderPage.problemRetrievingFolderDescription',
    defaultMessage:
      "Either it no longer exists, you don't have the permission to access it, or something unexpected happened when we were trying to retrieve it.",
  },
  goToTheWorkbin: {
    id: 'course.material.folders.ErrorRetrievingFolderPage.goToMainFolder',
    defaultMessage: 'Go to the main folder',
  },
});

const ErrorRetrievingFolderPage = (): JSX.Element => {
  const { t } = useTranslation();

  const params = useParams();
  const workbinURL = `/courses/${params.courseId}/materials/folders`;

  return (
    <MaterialStatusPage
      description={t(translations.problemRetrievingFolderDescription)}
      illustration={
        <div className="relative">
          <FolderOutlined className="text-[6rem]" color="disabled" />
          <Cancel
            className="absolute bottom-0 -right-2 text-[4rem] bg-white rounded-full"
            color="error"
          />
        </div>
      }
      title={t(translations.problemRetrievingFolder)}
    >
      <Link className="mt-10" to={workbinURL}>
        {t(translations.goToTheWorkbin)}
      </Link>
    </MaterialStatusPage>
  );
};

export default ErrorRetrievingFolderPage;
