import { FC, memo, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Switch } from '@mui/material';
import equal from 'fast-deep-equal';
import { Material } from 'types/course/admin/ragWise';

import { MATERIAL_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast, { loadingToast } from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { MATERIAL_SWITCH_TYPE } from '../../constants';
import { chunkMaterial, removeChunks } from '../../operations';

interface Props {
  materials: Material[];
  type: keyof typeof MATERIAL_SWITCH_TYPE;
  className?: string;
}

const translations = defineMessages({
  addSuccess: {
    id: 'course.admin.RagWiseSettings.KnowledgeBaseSwitch.addSuccess',
    defaultMessage:
      '{material} {n, plural, one {has} other {have}} been added to knowledge base.',
  },
  addFailure: {
    id: 'course.admin.RagWiseSettings.KnowledgeBaseSwitch.addFailure',
    defaultMessage: '{material} could not be added to knowledge base.',
  },
  removeSuccess: {
    id: 'course.admin.RagWiseSettings.KnowledgeBaseSwitch.removeSuccess',
    defaultMessage:
      '{material} {n, plural, one {has} other {have}} been removed from knowledge base.',
  },
  removeFailure: {
    id: 'course.admin.RagWiseSettings.KnowledgeBaseSwitch.removeFailure',
    defaultMessage: '{material} could not be removed from knowledge base.',
  },
  pendingAdd: {
    id: 'course.admin.RagWiseSettings.KnowledgeBaseSwitch.pendingAdd',
    defaultMessage:
      'Please wait as your request to add materials into knowledge base is being processed.\
      You may close this window while adding is in progress.',
  },
});

const MaterialKnowledgeBaseSwitch: FC<Props> = (props) => {
  const { materials, type, className } = props;
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const hasNoMaterials = materials.length === 0;
  const notChunkedMaterials = materials.filter(
    (material) => material.workflowState !== MATERIAL_WORKFLOW_STATE.chunked,
  );
  const chunkedMaterials = materials.filter(
    (material) => material.workflowState === MATERIAL_WORKFLOW_STATE.chunked,
  );
  const chunkingMaterials = materials.filter(
    (material) => material.workflowState === MATERIAL_WORKFLOW_STATE.chunking,
  );
  const notChunkedMaterialIds = notChunkedMaterials.map(
    (material) => material.id,
  );
  const chunkedMaterialIds = chunkedMaterials.map((material) => material.id);

  const onAdd = (): Promise<void> => {
    setIsLoading(true);

    const toastInstance =
      notChunkedMaterialIds.length > 1
        ? loadingToast(t(translations.pendingAdd))
        : toast;

    const materialName =
      notChunkedMaterialIds.length === 1
        ? notChunkedMaterials[0].name
        : 'Materials';

    return dispatch(
      chunkMaterial(
        notChunkedMaterialIds,
        () => {
          setIsLoading(false);
          toastInstance.success(
            t(translations.addSuccess, {
              material: materialName,
              n: notChunkedMaterialIds.length,
            }),
          );
        },
        () => {
          setIsLoading(false);
          toastInstance.error(
            t(translations.addFailure, { material: materialName }),
          );
        },
      ),
    );
  };

  const onRemove = async (): Promise<void> => {
    setIsLoading(true);

    const materialName =
      chunkedMaterialIds.length === 1 ? chunkedMaterials[0].name : 'Materials';

    try {
      await dispatch(removeChunks(chunkedMaterialIds));
      toast.success(
        t(translations.removeSuccess, {
          material: materialName,
          n: chunkedMaterialIds.length,
        }),
      );
    } catch (error) {
      toast.error(t(translations.removeSuccess, { material: materialName }));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      type === MATERIAL_SWITCH_TYPE.material &&
      materials[0].workflowState === MATERIAL_WORKFLOW_STATE.chunking &&
      !isLoading
    ) {
      onAdd();
    }
  }, [isLoading]);

  return (
    <Switch
      checked={
        hasNoMaterials ? false : chunkedMaterials.length === materials.length
      }
      className={className}
      color="primary"
      disabled={
        (chunkingMaterials.length > 0 &&
          chunkingMaterials.length === notChunkedMaterials.length) ||
        isLoading ||
        hasNoMaterials
      }
      onChange={(_, isChecked): void => {
        if (isChecked) {
          onAdd();
        } else {
          onRemove();
        }
      }}
    />
  );
};

export default memo(MaterialKnowledgeBaseSwitch, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
