import produce from 'immer';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';

import {
  AssessmentCategory,
  AssessmentTab,
} from 'types/course/admin/assessments';
import useTranslation from 'lib/hooks/useTranslation';
import Category from './Category';
import translations from '../translations';

interface Props {
  categories: AssessmentCategory[];
  onUpdate?: (categories: AssessmentCategory[]) => void;
  onDeleteCategory?: (
    id: AssessmentCategory['id'],
    title: AssessmentCategory['title'],
  ) => void;
  onDeleteTabInCategory?: (
    id: AssessmentCategory['id'],
    tabId: AssessmentTab['id'],
    title: AssessmentTab['title'],
  ) => void;
  onCreateCategory?: (
    title: AssessmentCategory['title'],
    weight: AssessmentCategory['weight'],
  ) => void;
  onCreateTabInCategory?: (
    id: AssessmentCategory['id'],
    title: AssessmentTab['title'],
    weight: AssessmentTab['weight'],
  ) => void;
}

export const BOARD = 'board';
export const TABS = 'tabs';

const AssessmentCategoriesManager = (props: Props): JSX.Element => {
  const { categories } = props;
  const { t } = useTranslation();

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
    const sortedCategories = unsortedCategories.map((category, index) => ({
      id: category.id,
      title: category.title,
      weight: index + 1,
      tabs: category.tabs.map((tab, tabIndex) => ({
        id: tab.id,
        title: tab.title,
        weight: tabIndex + 1,
        categoryId: tab.categoryId,
      })),
    }));

    props.onUpdate?.(sortedCategories);
  };

  const createCategory = (): void =>
    props.onCreateCategory?.(
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

          const srcid = parseInt(sourceCategoryIndex[0], 10);
          const destid = parseInt(destinationCategoryIndex[0], 10);

          const sourceCategory = draft[srcid];
          const destinationCategory = draft[destid];

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
        index={index}
        onDelete={props.onDeleteCategory}
        onDeleteTab={props.onDeleteTabInCategory}
        onRename={renameCategory}
        onRenameTab={renameTabInCategory}
        onCreateTab={props.onCreateTabInCategory}
      />
    ));

  return (
    <>
      <Button startIcon={<Add />} onClick={createCategory}>
        {t(translations.addACategory)}
      </Button>

      <DragDropContext
        onDragStart={vibrate()}
        onDragUpdate={vibrate(30)}
        onDragEnd={rearrange}
      >
        <Droppable droppableId={BOARD} type={BOARD}>
          {(provided): JSX.Element => (
            <div
              className="-mb-5"
              ref={provided.innerRef}
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
