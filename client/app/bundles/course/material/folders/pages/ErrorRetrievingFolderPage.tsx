import React, { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Cancel, FolderOutlined } from '@mui/icons-material';

import { loadDefaultMaterialId } from 'course/material/folders/handles';
import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import BaseRetrieveMaterialPage from '../../component/BaseRetrieveMaterialPage';

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
    id: 'course.material.folders.ErrorRetrievingFolderPage.goToTheWorkbin',
    defaultMessage: 'Go to the Workbin',
  },
});

const Illustration = (): JSX.Element => (
  <div className="relative">
    <FolderOutlined className="text-[6rem]" color="disabled" />
    <Cancel
      className="absolute bottom-0 -right-2 text-[4rem] bg-white rounded-full"
      color="error"
    />
  </div>
);

const useWorkbinURL = (courseId: string | undefined): string => {
  const [workbinURL, setWorkbinURL] = useState(`/courses/${courseId}`);

  useEffect(() => {
    if (courseId) {
      loadDefaultMaterialId().then((defaultMaterialId) => {
        setWorkbinURL(
          `/courses/${courseId}/materials/folders/${defaultMaterialId}`,
        );
      });
    }
  }, [courseId]);

  return workbinURL;
};

const ErrorRetrievingFolderPage = (): JSX.Element => {
  const { t } = useTranslation();
  const params = useParams();
  const workbinURL = useWorkbinURL(params.courseId);

  return (
    <BaseRetrieveMaterialPage
      description={t(translations.problemRetrievingFolderDescription)}
      illustration={<Illustration />}
      title={t(translations.problemRetrievingFolder)}
    >
      <Link className="mt-10" to={workbinURL}>
        {t(translations.goToTheWorkbin)}
      </Link>
    </BaseRetrieveMaterialPage>
  );
};

export default ErrorRetrievingFolderPage;
