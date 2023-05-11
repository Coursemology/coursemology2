import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import produce from 'immer';
import {
  AssessmentCategory,
  AssessmentTab,
} from 'types/course/admin/assessments';

import useTranslation from 'lib/hooks/useTranslation';

import { useAssessmentSettings } from '../AssessmentSettingsContext';
import translations from '../translations';

import Category from './Category';
import { sortCategories } from './utils';

interface Props {
  categories: AssessmentCategory[];
  onUpdate?: (categories: AssessmentCategory[]) => void;
  disabled?: boolean;
}

export const BOARD = 'board';
export const TABS = 'tabs';

const AssessmentCategoriesManager = (props: Props): JSX.Element => {
  const { categories } = props;
  const { t } = useTranslation();
  const { createCategory, settings } = useAssessmentSettings();

  const renameCategory = (
    index: number,
    newTitle: AssessmentCategory['title'],
  ): void =>
    props.onUpdate?.(
      produce(categories, (draft) => {
        draft[index].title = newTitle;
      }),
    );

  const renameTabInCategory = (
    index: number,
    tabIndex: number,
    newTitle: AssessmentTab['title'],
  ): void =>
    props.onUpdate?.(
      produce(categories, (draft) => {
        draft[index].tabs[tabIndex].title = newTitle;
      }),
    );

  const setCategories = (unsortedCategories: AssessmentCategory[]): void => {
    props.onUpdate?.(sortCategories(unsortedCategories));
  };

  const handleCreateCategory = (): void =>
    createCategory?.(
      t(translations.newCategoryDefaultName),
      categories[categories.length - 1].weight + 1,
    );

  const rearrange = (result: DropResult): void => {
    if (!result.destination) return;

    const source = result.source;
    const destination = result.destination;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (result.type === BOARD)
      setCategories(
        produce(categories, (draft) => {
          const [category] = draft.splice(source.index, 1);
          draft.splice(destination.index, 0, category);
        }),
      );

    if (result.type === TABS)
      setCategories(
        produce(categories, (draft) => {
          const sourceCategoryIndex = source.droppableId.match(/\d+/);
          const destinationCategoryIndex = destination.droppableId.match(/\d+/);
          if (!sourceCategoryIndex || !destinationCategoryIndex) return;

          const sourceId = parseInt(sourceCategoryIndex[0], 10);
          const sourceCategory = draft[sourceId];

          const destinationId = parseInt(destinationCategoryIndex[0], 10);
          const destinationCategory = draft[destinationId];

          const [tab] = sourceCategory.tabs.splice(source.index, 1);
          destinationCategory.tabs.splice(destination.index, 0, tab);
        }),
      );
  };

  const vibrate =
    (strength = 100) =>
    () =>
      // Vibration will only activate once the user interacts with the page (taps, scrolls,
      // etc.) at least once. This is an expected HTML intervention. Read more:
      // https://html.spec.whatwg.org/multipage/interaction.html#tracking-user-activation
      navigator.vibrate?.(strength);

  const renderCategories = (
    categoriesToRender: AssessmentCategory[],
  ): JSX.Element[] =>
    categoriesToRender.map((category: AssessmentCategory, index: number) => (
      <Category
        key={category.id}
        category={category}
        disabled={props.disabled}
        index={index}
        onRename={renameCategory}
        onRenameTab={renameTabInCategory}
        stationary={categories.length <= 1}
      />
    ));

  return (
    <>
      {settings?.canCreateCategories && (
        <Button
          disabled={props.disabled}
          onClick={handleCreateCategory}
          startIcon={<Add />}
        >
          {t(translations.addACategory)}
        </Button>
      )}

      <DragDropContext
        onDragEnd={rearrange}
        onDragStart={vibrate()}
        onDragUpdate={vibrate(30)}
      >
        <Droppable droppableId={BOARD} type={BOARD}>
          {(provided): JSX.Element => (
            <div
              ref={provided.innerRef}
              className="-mb-5"
              {...provided.droppableProps}
            >
              {renderCategories(categories)}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default AssessmentCategoriesManager;
