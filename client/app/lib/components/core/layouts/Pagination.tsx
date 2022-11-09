import { FC, memo, useEffect } from 'react';
import { Pagination as PaginationMUI } from '@mui/material';
import equal from 'fast-deep-equal';

interface Props {
  // Typing is any as it can be an array of any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  itemsPerPage: number;
  // Typing is also any, following from items: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSlicedItems: React.Dispatch<React.SetStateAction<any[]>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  padding?: number;
}

/*
This componenet serves as an abstraction for front end pagination, and is written
on top of the pagination that MUI offers.

How to use: (can refer to CourseDisplay.tsx for example)

items - An array of objects that you need to paginate.

itemsPerPage: - The number of items you want per page (12, 24, 36 or 42)

setSlicedItems - A useState function, to set your sliced items for you to use in a 
higher component.
e.g. const [slicedItems, setSlicedItems] = useState(items);
You can then manipulate the slicedItems however you choose.

page, setPage - Initialize these with useState(1) and pass them down.
This is to ensure that multiple paginations within the same page are both synced properly.
*/

const Pagination: FC<Props> = (props) => {
  const { items, itemsPerPage, setSlicedItems, page, setPage, padding } = props;

  const count = Math.ceil(items.length / itemsPerPage);

  useEffect(() => {
    const begin = (page - 1) * itemsPerPage;
    setSlicedItems(items.slice(begin, begin + itemsPerPage));

    if (count < page) {
      setPage(1);
    }
  }, [page, items]);

  const handleChange: (
    _e: React.ChangeEvent<unknown>,
    pageNum: number,
  ) => void = (_e, pageNum) => {
    setPage(pageNum);
  };

  if (count <= 1) return null;

  return (
    <PaginationMUI
      color="primary"
      variant="outlined"
      style={{
        padding: padding ?? 24,
        display: 'flex',
        justifyContent: 'center',
      }}
      count={count}
      page={page}
      onChange={handleChange}
    />
  );
};

export default memo(Pagination, (prevProps, nextProps) => {
  return (
    equal(prevProps.items, nextProps.items) &&
    equal(prevProps.page, nextProps.page)
  );
});
