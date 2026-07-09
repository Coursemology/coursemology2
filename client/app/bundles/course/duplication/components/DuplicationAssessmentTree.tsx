import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Tooltip } from 'react-tooltip';
import { Card, CardContent } from '@mui/material';

import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';
import useTranslation from 'lib/hooks/useTranslation';

import TypeBadge from './TypeBadge';
import UnpublishedIcon from './UnpublishedIcon';

export interface DuplicationTreeCategory {
  id: number;
  title: string;
}
export interface DuplicationTreeTab {
  id: number;
  title: string;
}
export interface DuplicationTreeAssessment {
  id: number;
  title: string;
}
export interface DuplicationAssessmentTreeNode {
  category: DuplicationTreeCategory | null;
  tabs: Array<{
    tab: DuplicationTreeTab | null;
    assessments: DuplicationTreeAssessment[];
  }>;
}

interface Props {
  nodes: DuplicationAssessmentTreeNode[];
}

// IDs kept identical to the strings previously defined in AssessmentsListing /
// DuplicateItemsConfirmation so locales/en.json needs no re-translation.
const translations = defineMessages({
  defaultCategory: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.AssessmentsListing.defaultCategory',
    defaultMessage: 'Default Category',
  },
  defaultTab: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.AssessmentsListing.defaultTab',
    defaultMessage: 'Default Tab',
  },
  itemUnpublished: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.itemUnpublished',
    defaultMessage:
      'Items are duplicated as unpublished when duplicating to an existing course.',
  },
});

const DuplicationAssessmentTree: FC<Props> = ({ nodes }) => {
  const { t } = useTranslation();

  const renderAssessmentRow = (
    assessment: DuplicationTreeAssessment,
  ): JSX.Element => (
    <IndentedCheckbox
      key={`assessment_${assessment.id}`}
      checked
      indentLevel={2}
      label={
        <span className="flex items-center">
          <TypeBadge itemType="ASSESSMENT" />
          <UnpublishedIcon tooltipId="itemUnpublished" />
          {assessment.title}
        </span>
      }
    />
  );

  const renderTabTree = (
    tab: DuplicationTreeTab | null,
    assessments: DuplicationTreeAssessment[],
  ): JSX.Element => (
    <div key={tab ? `tab_${tab.id}` : 'tab_default'}>
      {tab ? (
        <IndentedCheckbox
          checked
          indentLevel={1}
          label={
            <span>
              <TypeBadge itemType="TAB" />
              {tab.title}
            </span>
          }
        />
      ) : (
        <IndentedCheckbox
          disabled
          indentLevel={1}
          label={t(translations.defaultTab)}
        />
      )}
      {assessments.map(renderAssessmentRow)}
    </div>
  );

  const renderNode = (
    node: DuplicationAssessmentTreeNode,
    index: number,
  ): JSX.Element => (
    <Card
      key={
        node.category
          ? `category_${node.category.id}`
          : `category_default_${index}`
      }
    >
      <CardContent>
        {node.category ? (
          <IndentedCheckbox
            checked
            label={
              <span>
                <TypeBadge itemType="CATEGORY" />
                {node.category.title}
              </span>
            }
          />
        ) : (
          <IndentedCheckbox disabled label={t(translations.defaultCategory)} />
        )}
        {node.tabs.map(({ tab, assessments }) =>
          renderTabTree(tab, assessments),
        )}
      </CardContent>
    </Card>
  );

  if (nodes.length === 0) return null;

  return (
    <>
      {nodes.map(renderNode)}
      <Tooltip id="itemUnpublished">{t(translations.itemUnpublished)}</Tooltip>
    </>
  );
};

export default DuplicationAssessmentTree;
