import { FC, memo, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Switch } from '@mui/material';
import equal from 'fast-deep-equal';
import { Material } from 'types/course/admin/ragWise';

import { MATERIAL_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { chunkMaterial, removeChunks } from '../../operations';

interface Props {
  material: Material;
}

const translations = defineMessages({
  addSuccess: {
    id: 'course.admin.RagWiseSettings.KnowledgeBaseSwitch.addSuccess',
    defaultMessage: '{material} has been added to knowledge base.',
  },
  addFailure: {
    id: 'course.admin.RagWiseSettings.KnowledgeBaseSwitch.addFailure',
    defaultMessage: '{material} could not be added to knowledge base.',
  },
  removeSuccess: {
    id: 'course.admin.RagWiseSettings.KnowledgeBaseSwitch.removeSuccess',
    defaultMessage: '{material} has been removed from knowledge base.',
  },
  removeFailure: {
    id: 'course.admin.RagWiseSettings.KnowledgeBaseSwitch.removeFailure',
    defaultMessage: '{material} could not be removed from knowledge base.',
  },
});

const KnowledgeBaseSwitch: FC<Props> = (props) => {
  const { material } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const onAdd = (): Promise<void> => {
    setIsLoading(true);
    return dispatch(
      chunkMaterial(
        material.folderId,
        material.id,
        () => {
          setIsLoading(false);
          toast.success(
            t(translations.addSuccess, {
              material: material.name,
            }),
          );
        },
        () => {
          setIsLoading(false);
          toast.error(
            t(translations.addFailure, {
              material: material.name,
            }),
          );
        },
      ),
    );
  };

  const onRemove = (): Promise<void> => {
    setIsLoading(true);
    return dispatch(removeChunks(material.folderId, material.id))
      .then(() => {
        toast.success(
          t(translations.removeSuccess, {
            material: material.name,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.removeFailure, {
            material: material.name,
          }),
        );
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (
      material.workflowState === MATERIAL_WORKFLOW_STATE.chunking &&
      !isLoading
    ) {
      onAdd();
    }
  }, [isLoading]);

  return (
    <Switch
      key={material.workflowState}
      checked={material.workflowState === MATERIAL_WORKFLOW_STATE.chunked}
      color="primary"
      disabled={
        isLoading || material.workflowState === MATERIAL_WORKFLOW_STATE.chunking
      }
      onChange={
        material.workflowState === MATERIAL_WORKFLOW_STATE.not_chunked
          ? onAdd
          : onRemove
      }
    />
  );
};

export default memo(KnowledgeBaseSwitch, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
