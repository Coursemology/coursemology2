import { FC, memo, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Switch } from '@mui/material';
import equal from 'fast-deep-equal';
import { ForumImport } from 'types/course/admin/ragWise';

import { useAppDispatch } from 'lib/hooks/store';
import toast, { loadingToast } from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import {
  FORUM_IMPORT_WORKFLOW_STATE,
  FORUM_SWITCH_TYPE,
} from '../../constants';
import { destroyImportedDiscussions, importForum } from '../../operations';

interface Props {
  forumImports: ForumImport[];
  canMangeForumImport: boolean;
  className?: string;
  type: keyof typeof FORUM_SWITCH_TYPE;
}

const translations = defineMessages({
  addSuccess: {
    id: 'course.admin.RagWiseSettings.ForumKnowledgeBaseSwitch.addSuccess',
    defaultMessage:
      '{forum} {n, plural, one {has} other {have}} been added to knowledge base.',
  },
  addFailure: {
    id: 'course.admin.RagWiseSettings.ForumKnowledgeBaseSwitch.addFailure',
    defaultMessage: '{forum} could not be added to knowledge base.',
  },
  removeSuccess: {
    id: 'course.admin.RagWiseSettings.ForumKnowledgeBaseSwitch.removeSuccess',
    defaultMessage:
      '{forum} {n, plural, one {has} other {have}} been removed from knowledge base.',
  },
  removeFailure: {
    id: 'course.admin.RagWiseSettings.ForumKnowledgeBaseSwitch.removeFailure',
    defaultMessage: '{forum} could not be removed from knowledge base.',
  },
  pendingImport: {
    id: 'course.admin.RagWiseSettings.ForumKnowledgeBaseSwitch.pendingImport',
    defaultMessage:
      'Please wait as your request to import forums into knowledge base is being processed.\
      You may close this window while importing is in progress.',
  },
});

const ForumKnowledgeBaseSwitch: FC<Props> = (props) => {
  const { forumImports, type, canMangeForumImport, className } = props;
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const hasNoForumImports = forumImports.length === 0;
  const notImportedForumImports = forumImports.filter(
    (forumImport) =>
      forumImport.workflowState !== FORUM_IMPORT_WORKFLOW_STATE.imported,
  );
  const importedForumImports = forumImports.filter(
    (forumImport) =>
      forumImport.workflowState === FORUM_IMPORT_WORKFLOW_STATE.imported,
  );
  const importingForumImports = forumImports.filter(
    (forumImport) =>
      forumImport.workflowState === FORUM_IMPORT_WORKFLOW_STATE.importing,
  );
  const notImportedForumImportIds = notImportedForumImports.map(
    (forumImport) => forumImport.id,
  );
  const importedForumImportIds = importedForumImports.map(
    (forumImport) => forumImport.id,
  );

  const onImport = (): Promise<void> => {
    setIsLoading(true);

    const toastInstance =
      notImportedForumImportIds.length > 1
        ? loadingToast(t(translations.pendingImport))
        : toast;

    const forumName =
      notImportedForumImportIds.length === 1
        ? notImportedForumImports[0].name
        : 'Forums';

    return dispatch(
      importForum(
        notImportedForumImportIds,
        () => {
          setIsLoading(false);
          toastInstance.success(
            t(translations.addSuccess, {
              forum: forumName,
              n: notImportedForumImportIds.length,
            }),
          );
        },
        () => {
          setIsLoading(false);
          toastInstance.error(t(translations.addFailure, { forum: forumName }));
        },
      ),
    );
  };

  const onRemove = async (): Promise<void> => {
    setIsLoading(true);

    const forumName =
      importedForumImportIds.length === 1
        ? importedForumImports[0].name
        : 'Forums';

    try {
      await dispatch(destroyImportedDiscussions(importedForumImportIds));
      toast.success(
        t(translations.removeSuccess, {
          forum: forumName,
          n: importedForumImportIds.length,
        }),
      );
    } catch (error) {
      toast.error(
        t(translations.removeFailure, {
          forum: forumName,
        }),
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      type === FORUM_SWITCH_TYPE.forum_import &&
      forumImports[0].workflowState === FORUM_IMPORT_WORKFLOW_STATE.importing &&
      !isLoading
    ) {
      onImport();
    }
  }, [isLoading, canMangeForumImport]);

  return (
    <Switch
      checked={
        hasNoForumImports
          ? false
          : importedForumImports.length === forumImports.length
      }
      className={className}
      color="primary"
      disabled={
        !canMangeForumImport ||
        isLoading ||
        hasNoForumImports ||
        (importingForumImports.length > 0 &&
          importingForumImports.length === notImportedForumImports.length)
      }
      onChange={(_, isChecked): void => {
        if (isChecked) {
          onImport();
        } else {
          onRemove();
        }
      }}
    />
  );
};

export default memo(ForumKnowledgeBaseSwitch, (prevProps, nextProps) => {
  return equal(prevProps.forumImports, nextProps.forumImports);
});
