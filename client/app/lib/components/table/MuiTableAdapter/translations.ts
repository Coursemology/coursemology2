import { defineMessages } from 'react-intl';

const translations = defineMessages({
  filter: {
    id: 'lib.table.MuiTableAdapter.filter.filter',
    defaultMessage: 'Filter',
  },
  clearFilter: {
    id: 'lib.table.MuiTableAdapter.filter.clearFilter',
    defaultMessage: 'Clear filter',
  },
  filterIndex: {
    id: 'lib.table.MuiTableAdapter.filter.filterIndex',
    defaultMessage: 'Filter {index}',
  },
  all: {
    id: 'lib.table.MuiTableAdapter.pagination.all',
    defaultMessage: 'All',
  },
  rowsPerPage: {
    id: 'lib.table.MuiTableAdapter.pagination.rowsPerPage',
    defaultMessage: 'Rows per page:',
  },
  search: {
    id: 'lib.table.MuiTableAdapter.search.search',
    defaultMessage: 'Search',
  },
  downloadAsCsv: {
    id: 'lib.table.MuiTableAdapter.csv.downloadAsCsv',
    defaultMessage: 'Download as CSV',
  },
});

export default translations;
