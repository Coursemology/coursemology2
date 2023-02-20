interface FilterProps {
  filters: unknown[];
  uniqueFilterValues: unknown[];
  getFilterLabel?: (value: unknown) => string;
  onAddFilter?: (value: unknown) => void;
  onRemoveFilter?: (value: unknown) => void;
  onClearFilters?: () => void;
  clearFiltersLabel?: string;
  tooltipLabel?: string;
  className?: string;
}

export default FilterProps;
