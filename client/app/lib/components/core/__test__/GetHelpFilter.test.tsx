import { MessageDescriptor } from 'react-intl';
import { fireEvent, render, screen } from 'test-utils';

import moment from 'lib/moment';
import translations from 'lib/translations/getHelp';

import GetHelpFilter, {
  getFilterForDateChange,
  GetHelpFilterFields,
} from '../GetHelpFilter';

interface TestFilter extends GetHelpFilterFields {
  assessment: { title: string } | null;
}

interface Props {
  userOptions: { name: string }[];
  selectedFilter: TestFilter;
  setSelectedFilter: (filter: TestFilter) => void;
  onFilterChange?: (filter: TestFilter) => void;
  getDateValidationError: (
    filter: TestFilter,
    t: (msg: MessageDescriptor) => string,
  ) => string;
  primaryField: {
    label: MessageDescriptor;
    options: { title: string }[];
    value: { title: string } | null;
    setValue: (
      filter: TestFilter,
      value: { title: string } | null,
    ) => TestFilter;
  };
}

// Shared references: MUI Autocomplete compares the selected value to its
// options by reference, so a selected value must be the same object as an
// option (as it would be in real usage, where it comes from `onChange`).
const ALPHA = { title: 'Alpha' };
const BETA = { title: 'Beta' };
const AMY = { name: 'Amy' };
const ZOE = { name: 'Zoe' };

const baseFilter: TestFilter = {
  assessment: null,
  user: null,
  startDate: '2024-06-09',
  endDate: '2024-06-15',
};

const makeProps = (overrides: Partial<Props> = {}): Props => {
  const selectedFilter = overrides.selectedFilter ?? baseFilter;
  return {
    userOptions: [ZOE, AMY],
    setSelectedFilter: jest.fn(),
    onFilterChange: jest.fn(),
    getDateValidationError: jest.fn(() => ''),
    ...overrides,
    selectedFilter,
    primaryField: {
      label: translations.filterAssessmentLabel,
      options: [BETA, ALPHA],
      value: selectedFilter.assessment,
      setValue: (filter, value) => ({ ...filter, assessment: value }),
      ...overrides.primaryField,
    },
  };
};

// `render` mounts behind an async i18n loading gate; wait for the filter's
// first field to appear before asserting.
const renderFilter = async (overrides: Partial<Props> = {}): Promise<Props> => {
  const props = makeProps(overrides);
  render(<GetHelpFilter {...props} />);
  await screen.findByLabelText('Start Date');
  return props;
};

describe('<GetHelpFilter />', () => {
  it('renders the primary, student, and date fields with current values', async () => {
    await renderFilter();

    expect(screen.getByLabelText('Filter by Assessment')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by Student')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toHaveValue('09/06/2024');
    expect(screen.getByLabelText('End Date')).toHaveValue('15/06/2024');
  });

  it('reflects the selected primary and user values', async () => {
    await renderFilter({
      selectedFilter: {
        ...baseFilter,
        assessment: ALPHA,
        user: AMY,
      },
    });

    expect(screen.getByLabelText('Filter by Assessment')).toHaveValue('Alpha');
    expect(screen.getByLabelText('Filter by Student')).toHaveValue('Amy');
  });

  it('renders all preset range chips', async () => {
    await renderFilter();

    [
      'Last 7 Days',
      'Last 14 Days',
      'Last 30 Days',
      'Last 6 Months',
      'Last 12 Months',
    ].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
  });

  it('applies a preset range when its chip is clicked', async () => {
    const props = await renderFilter();

    fireEvent.click(screen.getByText('Last 7 Days'));

    const applied = (props.setSelectedFilter as jest.Mock).mock.calls[0][0];
    const dayDiff =
      (new Date(applied.endDate).getTime() -
        new Date(applied.startDate).getTime()) /
      (1000 * 60 * 60 * 24);

    expect(dayDiff).toBe(6); // 7 days inclusive
    expect(props.setSelectedFilter).toHaveBeenCalledTimes(1);
    expect(props.onFilterChange).toHaveBeenCalledTimes(1);
    expect((props.onFilterChange as jest.Mock).mock.calls[0][0]).toBe(applied);
  });

  it('preserves the non-date fields when a preset is applied', async () => {
    const props = await renderFilter({
      selectedFilter: {
        ...baseFilter,
        assessment: ALPHA,
        user: AMY,
      },
    });

    fireEvent.click(screen.getByText('Last 30 Days'));

    const applied = (props.setSelectedFilter as jest.Mock).mock.calls[0][0];
    expect(applied.assessment).toEqual({ title: 'Alpha' });
    expect(applied.user).toEqual({ name: 'Amy' });
    const dayDiff =
      (new Date(applied.endDate).getTime() -
        new Date(applied.startDate).getTime()) /
      (1000 * 60 * 60 * 24);
    expect(dayDiff).toBe(29); // 30 days inclusive
  });

  it('does not throw when no onFilterChange handler is provided', async () => {
    const props = await renderFilter({ onFilterChange: undefined });

    fireEvent.click(screen.getByText('Last 7 Days'));

    expect(props.setSelectedFilter).toHaveBeenCalledTimes(1);
  });

  it('shows the validation error and marks the end date field invalid', async () => {
    const message = 'Date range cannot exceed 365 days';
    await renderFilter({ getDateValidationError: jest.fn(() => message) });

    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInvalid();
  });

  it('leaves the end date field valid when there is no error', async () => {
    await renderFilter();

    expect(screen.getByLabelText('End Date')).toBeValid();
  });
});

describe('getFilterForDateChange', () => {
  // 6-day range: 2024-06-09 .. 2024-06-15
  const filter: TestFilter = {
    assessment: null,
    user: null,
    startDate: '2024-06-09',
    endDate: '2024-06-15',
  };

  it('returns null for a missing or invalid date', () => {
    expect(getFilterForDateChange(filter, null, 'startDate')).toBeNull();
    expect(getFilterForDateChange(filter, moment(NaN), 'endDate')).toBeNull();
  });

  describe('when the start date changes', () => {
    it('keeps the end date when the range stays within bounds', () => {
      const result = getFilterForDateChange(
        filter,
        moment('2024-06-10'),
        'startDate',
      );
      expect(result).toMatchObject({
        startDate: '2024-06-10',
        endDate: '2024-06-15',
      });
    });

    it('shifts the end date to preserve the range length when start moves past end', () => {
      const result = getFilterForDateChange(
        filter,
        moment('2024-06-20'),
        'startDate',
      );
      // range was 6 days, so the end follows to keep it 6 days
      expect(result).toMatchObject({
        startDate: '2024-06-20',
        endDate: '2024-06-26',
      });
    });

    it('clamps the end date so the range cannot exceed 365 days', () => {
      const result = getFilterForDateChange(
        filter,
        moment('2023-01-01'),
        'startDate',
      );
      expect(result).toMatchObject({
        startDate: '2023-01-01',
        endDate: '2024-01-01',
      });
    });
  });

  describe('when the end date changes', () => {
    it('keeps the start date when the range stays within bounds', () => {
      const result = getFilterForDateChange(
        filter,
        moment('2024-06-20'),
        'endDate',
      );
      expect(result).toMatchObject({
        startDate: '2024-06-09',
        endDate: '2024-06-20',
      });
    });

    it('shifts the start date to preserve the range length when end moves before start', () => {
      const result = getFilterForDateChange(
        filter,
        moment('2024-06-05'),
        'endDate',
      );
      expect(result).toMatchObject({
        startDate: '2024-05-30',
        endDate: '2024-06-05',
      });
    });

    it('clamps the start date so the range cannot exceed 365 days', () => {
      const result = getFilterForDateChange(
        filter,
        moment('2026-06-15'),
        'endDate',
      );
      expect(result).toMatchObject({
        startDate: '2025-06-15',
        endDate: '2026-06-15',
      });
    });
  });

  it('preserves the non-date fields', () => {
    const result = getFilterForDateChange(
      { ...filter, assessment: ALPHA, user: AMY },
      moment('2024-06-10'),
      'startDate',
    );
    expect(result?.assessment).toBe(ALPHA);
    expect(result?.user).toBe(AMY);
  });
});
