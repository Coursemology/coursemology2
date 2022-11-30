import Table from './Table';

export default Table;

export type { IterableColumnTemplate } from './builders/IterableTableBuilder';
export { default as iterableTableBuilderWith } from './builders/IterableTableBuilder';
export { default as staticTableBuilder } from './builders/StaticTableBuilder';
export { default as HorizontalTable } from './renderers/HorizontalTable';
export { default as VerticalTable } from './renderers/VerticalTable';
