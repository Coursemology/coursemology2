import { defineMessages } from 'react-intl';
import { AxiosError } from 'axios';
import { FolderData } from 'types/course/material/folders';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import componentTranslations from 'course/translations';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';

const translations = defineMessages({
  folderNotFound: {
    id: 'course.material.folders.FolderShow.folderNotFound',
    defaultMessage: 'Folder not found',
  },
  error: {
    id: 'course.material.folders.FolderShow.error',
    defaultMessage: '(Error)',
  },
});

/**
 * Returns a crumb path for the given breadcrumbs.
 * @param courseUrl
 * @param breadcrumbs
 * @returns CrumbPath
 */
const buildCrumbPath = (
  courseUrl: string,
  breadcrumbs: { id: number; name?: string }[],
): CrumbPath => ({
  activePath: `${courseUrl}/materials/folders/${breadcrumbs[0].id}`,
  content: breadcrumbs.map((crumb) => {
    if (crumb.id < 0) {
      return {
        title: translations.error,
        url: `materials/folders/`,
      };
    }

    return {
      title:
        crumb.name && crumb.name.length > 0
          ? crumb.name
          : componentTranslations.course_materials_component,
      url: `materials/folders/${crumb.id}`,
    };
  }),
});

/**
 * Retrieves the folder title and builds a crumb path.
 * If `folderId` is not provided, it fetches the current folder info.
 * @param courseUrl
 * @param folderId
 * @returns Promise<CrumbPath>
 */
const getFolderTitle = async (
  courseUrl: string,
  folderId?: number,
): Promise<CrumbPath> =>
  CourseAPI.folders
    .breadcrumbs(folderId)
    .then(({ data }) => buildCrumbPath(courseUrl, data.breadcrumbs))
    .catch((error) => {
      const breadcrumbs =
        (error as AxiosError<FolderData>).response?.data.breadcrumbs ?? [];
      return buildCrumbPath(courseUrl, [...breadcrumbs, { id: -1, name: '' }]);
    });

/**
 * `shouldRevalidate` here relies on the invariant that `folderHandle` is attached to
 * a route that is stable across different folders, i.e., `/materials/folders`. This route
 * will be the pathname that the Dynamic Nest API's builder uses to reconcile the children
 * of the Workbin's crumb.
 *
 * Note that Workbin has only ONE crumb, but multiple children in its `content`. This strategy
 * is due to the fact that the Workbin's URL does not reflect any information of the nesting of
 * the folders. Thus, `useMatches` cannot notify `useDynamicNest` of the changes in the routes,
 * e.g., `useDynamicNest` cannot know if we move out from Folder 2 to Folder 1 from the URL.
 */
export const folderHandle: DataHandle = (match) => {
  const folderId = getIdFromUnknown(match.params?.folderId);
  if (match.params?.folderId && !folderId)
    throw new Error(`Invalid folder id: ${folderId}`);

  const courseUrl = `/courses/${match.params.courseId}`;

  return {
    shouldRevalidate: true,
    getData: () => getFolderTitle(courseUrl, folderId),
  };
};
