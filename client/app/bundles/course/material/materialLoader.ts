import { defineMessages } from 'react-intl';
import { LoaderFunction, redirect } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import toast from 'lib/hooks/toast';
import { Translated } from 'lib/hooks/useTranslation';

const translations = defineMessages({
  errorAccessingMaterial: {
    id: 'material.attemptLoader.errorAccessingMaterial',
    defaultMessage:
      'An error occurred while accessing this material. Try again later.',
  },
});

const materialLoader: Translated<LoaderFunction> =
  (t) =>
  async ({ params }) => {
    const { courseId } = params;

    try {
      const folderId = getIdFromUnknown(params?.folderId);
      const materialId = getIdFromUnknown(params?.materialId);
      if (!folderId || !materialId) return redirect('/');

      const { data } = await CourseAPI.materials.fetch(folderId, materialId);

      window.location.href = data.redirectUrl;
      return redirect(`/courses/${courseId}/materials/folders/${folderId}`);
    } catch {
      toast.error(t(translations.errorAccessingMaterial));

      if (!courseId) return redirect('/');

      return redirect(`/courses/${courseId}`);
    }
  };

export default materialLoader;
